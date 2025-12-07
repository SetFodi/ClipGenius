'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    paypal?: any
  }
}

interface PayPalUpgradeButtonProps {
  plan: 'creator' | 'pro'
}

export function PayPalUpgradeButton({ plan }: PayPalUpgradeButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (!clientId) {
      setError('Connect PayPal in env to enable upgrades.')
      return
    }

    if (!containerRef.current) return

    function renderButtons() {
      if (!window.paypal || !containerRef.current) return

      // Clear any existing buttons (prevents duplicates in React Strict Mode)
      containerRef.current.innerHTML = ''

      window.paypal
        .Buttons({
          style: {
            layout: 'horizontal',
            height: 40,
          },
          createOrder: async () => {
            const res = await fetch('/api/billing/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan }),
            })
            const data = await res.json()
            if (!res.ok || !data.orderID) {
              const msg = data.error || 'Failed to create PayPal order'
              setError(msg)
              throw new Error(msg)
            }
            return data.orderID
          },
          onApprove: async (data: any) => {
            const res = await fetch('/api/billing/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan, orderID: data.orderID }),
            })
            const result = await res.json()
            if (!res.ok) {
              setError(result.error || 'Payment failed')
              return
            }
            setError(null)
            router.push('/dashboard')
          },
          onError: (err: any) => {
            console.error('PayPal button error:', err)
            setError('PayPal error. Please try again.')
          },
        })
        .render(containerRef.current)

      setReady(true)
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paypal-sdk]'
    )

    if (existingScript) {
      if (window.paypal) {
        renderButtons()
      } else {
        existingScript.addEventListener('load', renderButtons)
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true
    script.setAttribute('data-paypal-sdk', 'true')
    script.addEventListener('load', renderButtons)
    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', renderButtons)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [plan, router])

  if (error) {
    return (
      <div className="mt-2 text-xs text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="mt-3">
      {!ready && (
        <p className="text-xs text-muted-foreground mb-2">
          Loading PayPal…
        </p>
      )}
      <div ref={containerRef} />
    </div>
  )
}


