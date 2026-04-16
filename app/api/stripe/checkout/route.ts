import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

const PRICE_IDS: Record<string, string> = {
  starter_founder: 'price_1TMyDtAZtcejARhHiAWuBGTO',
  basic_founder: 'price_1TMyGiAZtcejARhHPuGLldec',
  legacy_founder: 'price_1TMyHUAZtcejARhHDUSZpXUd',
  family_founder: 'price_1TMyIKAZtcejARhHSjagLIbz',
  estate_founder: 'price_1TMyJcAZtcejARhHDRoAKI1r',
  starter: 'price_1TMyDtAZtcejARhHiAWuBGTO',
  basic: 'price_1TMyGiAZtcejARhHPuGLldec',
  legacy: 'price_1TMyHUAZtcejARhHDUSZpXUd',
  family: 'price_1TMyIKAZtcejARhHSjagLIbz',
  estate: 'price_1TMyJcAZtcejARhHDRoAKI1r',
}

export async function POST(req: NextRequest) {
  try {
    const { tier, clerk_id, email } = await req.json()
    if (!tier || !clerk_id) return NextResponse.json({ error: 'Missing tier or clerk_id' }, { status: 400 })
    const priceId = PRICE_IDS[tier]
    if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://joinlegacyvault.com'}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://joinlegacyvault.com'}/dashboard?payment=cancelled`,
      customer_email: email,
      metadata: { clerk_id, tier },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
