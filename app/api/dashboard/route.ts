import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const clerkId = req.nextUrl.searchParams.get('clerk_id')
    const email = req.nextUrl.searchParams.get('email') || ''
    const fullName = req.nextUrl.searchParams.get('full_name') || ''

    if (!clerkId) return NextResponse.json({ error: 'Missing clerk_id' }, { status: 400 })

    await supabase.from('profiles').upsert({
      clerk_id: clerkId,
      email,
      full_name: fullName,
      last_active: new Date().toISOString(),
    }, { onConflict: 'clerk_id', ignoreDuplicates: false })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, plan, full_name')
      .eq('clerk_id', clerkId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const [entriesRes, recipientsRes, deliveredRes, deliveryRes] = await Promise.all([
      supabase.from('vault_entries').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('recipients').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('delivery_events').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('delivery_settings').select('inactivity_enabled, unlock_enabled').eq('user_id', profile.id).maybeSingle(),
    ])

    return NextResponse.json({
      plan: profile.plan || '',
      fullName: profile.full_name || '',
      profileId: profile.id,
      vaultEntries: entriesRes.count ?? 0,
      recipients: recipientsRes.count ?? 0,
      delivered: deliveredRes.count ?? 0,
      deliveryConfigured: deliveryRes.data?.inactivity_enabled || deliveryRes.data?.unlock_enabled || false,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
