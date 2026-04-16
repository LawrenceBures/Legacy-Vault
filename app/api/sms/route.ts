import { NextRequest, NextResponse } from 'next/server'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!

async function sendSMS(to: string, body: string) {
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: to,
        Body: body,
      }).toString(),
    }
  )
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { type, to, name, tier } = await req.json()
    if (!to) return NextResponse.json({ error: 'Missing phone number' }, { status: 400 })

    let message = ''

    if (type === 'waitlist_confirmation') {
      message = `🔒 Legacy Vault: Your ${tier || 'founders'} spot is locked in${name ? `, ${name}` : ''}! You're grandfathered in forever. We launch May 15, 2026 — we'll text you when we're live. joinlegacyvault.com`
    } else if (type === 'launch_notification') {
      message = `🔒 Legacy Vault is LIVE${name ? `, ${name}` : ''}! Your vault is ready. Open it now → joinlegacyvault.com/sign-up`
    } else if (type === 'warning') {
      const days = req.nextUrl.searchParams.get('days') || '7'
      message = `⚠️ Legacy Vault: Your vault delivers in ${days} days if you don't check in. Visit joinlegacyvault.com/dashboard to reset your timer.`
    } else {
      return NextResponse.json({ error: 'Unknown SMS type' }, { status: 400 })
    }

    const result = await sendSMS(to, message)
    return NextResponse.json(result)
  } catch (err) {
    console.error('SMS error:', err)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
