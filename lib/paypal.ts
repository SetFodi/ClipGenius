const PAYPAL_MODE = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox'

function getBaseUrl() {
  return PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !secret) {
    throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.')
  }

  return { clientId, secret }
}

async function getAccessToken(): Promise<string> {
  const { clientId, secret } = getCredentials()
  const baseUrl = getBaseUrl()

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

const PLAN_PRICES: Record<'creator' | 'pro', string> = {
  creator: '4.99',
  pro: '8.99',
}

export async function createPayPalOrder(plan: 'creator' | 'pro', userId: string) {
  const baseUrl = getBaseUrl()
  const accessToken = await getAccessToken()
  const amount = PLAN_PRICES[plan]

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          custom_id: `${plan}:${userId}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal create order failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}

export async function capturePayPalOrder(orderId: string) {
  const baseUrl = getBaseUrl()
  const accessToken = await getAccessToken()

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal capture failed: ${res.status} ${text}`)
  }

  return res.json()
}


