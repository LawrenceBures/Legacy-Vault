import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const entryId = req.nextUrl.searchParams.get('entry')
    const token = req.nextUrl.searchParams.get('token')

    if (!entryId) {
      return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 })
    }

    const { data: entry, error: entryError } = await supabase
      .from('vault_entries')
      .select('id, title, format, message_content, media_url, created_at, user_id, status')
      .eq('id', entryId)
      .single()

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Only allow viewing entries that have been officially delivered.
    // Active (not yet delivered) entries must not be accessible.
    if (entry.status !== 'delivered') {
      return NextResponse.json(
        { error: 'This entry has not been delivered yet.' },
        { status: 403 }
      )
    }

    // Get sender name from profile
    let senderName = 'Someone who loves you'
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', entry.user_id)
      .single()

    if (profile?.full_name) {
      senderName = profile.full_name
    }

    // Don't expose internal fields to the public
    const { user_id, status, ...safeEntry } = entry

    return NextResponse.json({
      entry: safeEntry,
      senderName,
    })
  } catch (err: any) {
    console.error('GET /api/receive error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
