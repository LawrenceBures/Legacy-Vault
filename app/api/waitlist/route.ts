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
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
