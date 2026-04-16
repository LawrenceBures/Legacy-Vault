import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const clerkId = req.nextUrl.searchParams.get('clerk_id')
    if (!clerkId) return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 })

    const { data, error } = await supabase
      .from('profiles')
      .select('id, plan, full_name, has_completed_onboarding')
      .eq('clerk_id', clerkId)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clerk_id, email, full_name, plan } = body
    if (!clerk_id) return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 })

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ clerk_id, email, full_name, plan: plan || 'starter_founder' }, { onConflict: 'clerk_id' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
