import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal is not configured.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const plan = (body?.plan ?? '') as string

    if (plan !== 'creator' && plan !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan. Must be \"creator\" or \"pro\".' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderID = await createPayPalOrder(plan, user.id)
    return NextResponse.json({ orderID })
  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}


