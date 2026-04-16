import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { clerk_id } = await req.json()
    if (!clerk_id) return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 })

    const { error } = await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('clerk_id', clerk_id)

    if (error) throw error
    return NextResponse.json({ success: true, checkedIn: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
