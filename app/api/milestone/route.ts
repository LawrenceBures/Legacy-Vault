import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { vault_entry_id, milestone_date, milestone_label, user_id } = await req.json()
    if (!vault_entry_id || !milestone_date || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('milestone_deliveries')
      .insert({
        vault_entry_id,
        user_id,
        milestone_date,
        milestone_label: milestone_label || 'Custom milestone',
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Milestone error:', err)
    return NextResponse.json({ error: 'Failed to schedule milestone' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

    const { data, error } = await supabase
      .from('milestone_deliveries')
      .select('*, vault_entries(title, format)')
      .eq('user_id', userId)
      .order('milestone_date', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}
