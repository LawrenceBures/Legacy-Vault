import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, tier } = await req.json()
    if (!name || !email || !tier) return NextResponse.json({ error: 'Name, email and tier are required' }, { status: 400 })
    const { error } = await supabase.from('waitlist').insert({ name, email, phone, tier, created_at: new Date().toISOString() })
    if (error) throw error

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://joinlegacyvault.com'}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'waitlist_confirmation',
          to: email,
          name,
          tier,
        }),
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    // Send confirmation SMS if phone provided
    if (phone) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://joinlegacyvault.com'}/api/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'waitlist_confirmation',
            to: phone,
            name,
            tier,
          }),
        })
      } catch (smsErr) {
        console.error('SMS send failed:', smsErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
