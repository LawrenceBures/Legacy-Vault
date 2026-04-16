import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Find all milestones due today
    const { data: milestones } = await supabase
      .from('milestone_deliveries')
      .select('*, vault_entries(id, title, format, user_id), profiles(email, full_name)')
      .eq('milestone_date', today)
      .eq('status', 'scheduled')

    if (!milestones || milestones.length === 0) {
      return new Response(JSON.stringify({ message: 'No milestones due today' }), { status: 200 })
    }

    const results = []

    for (const milestone of milestones) {
      const entry = milestone.vault_entries
      if (!entry) continue

      // Get recipients for this entry
      const { data: entryRecipients } = await supabase
        .from('vault_entry_recipients')
        .select('recipient_id')
        .eq('vault_entry_id', entry.id)

      if (!entryRecipients) continue

      for (const er of entryRecipients) {
        const { data: recipient } = await supabase
          .from('recipients')
          .select('id, name, email')
          .eq('id', er.recipient_id)
          .single()

        if (!recipient) continue

        // Log delivery event
        await supabase.from('delivery_events').insert({
          vault_entry_id: entry.id,
          recipient_id: recipient.id,
          delivered_at: new Date().toISOString(),
          status: 'delivered',
        })

        results.push({
          milestone: milestone.milestone_label,
          entry: entry.title,
          recipient: recipient.email,
        })
      }

      // Mark milestone as delivered
      await supabase.from('milestone_deliveries')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', milestone.id)
    }

    return new Response(JSON.stringify({ delivered: results.length, results }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
