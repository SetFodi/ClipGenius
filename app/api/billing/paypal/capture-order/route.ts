import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const plan = (body?.plan ?? '') as string
    const orderID = (body?.orderID ?? '') as string

    if (plan !== 'creator' && plan !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan. Must be \"creator\" or \"pro\".' },
        { status: 400 }
      )
    }

    if (!orderID) {
      return NextResponse.json(
        { error: 'Missing orderID.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const captureResult = await capturePayPalOrder(orderID)

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment was not completed.' },
        { status: 400 }
      )
    }

    // Update user's plan
    const { error: upsertError } = await supabase
      .from('user_usage')
      .upsert(
        { user_id: user.id, plan },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('Failed to update user plan:', upsertError)
      return NextResponse.json(
        { error: 'Payment captured, but failed to update plan. Contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, plan })
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to capture PayPal order' },
      { status: 500 }
    )
  }
}


