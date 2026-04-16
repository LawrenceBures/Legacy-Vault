import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  try {
    const now = new Date()

    // Get all users with inactivity delivery enabled
    const { data: settings } = await supabase
      .from('delivery_settings')
      .select('user_id, time_window_days, warning_days, checkin_frequency')
      .eq('inactivity_enabled', true)

    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({ message: 'No active delivery settings' }), { status: 200 })
    }

    const results = []

    for (const setting of settings) {
      // Get user's last active time
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, last_active, clerk_id')
        .eq('id', setting.user_id)
        .single()

      if (!profile) continue

      const lastActive = new Date(profile.last_active || now)
      const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      const deliveryThreshold = setting.time_window_days || 60
      const warningDays = setting.warning_days || 7

      // Check if we should deliver
      if (daysSinceActive >= deliveryThreshold) {
        // Trigger delivery
        await triggerDelivery(profile.id, profile.email)
        results.push({ user: profile.email, action: 'delivered', days: daysSinceActive })
      } else if (daysSinceActive >= deliveryThreshold - warningDays) {
        // Send warning
        const daysRemaining = deliveryThreshold - daysSinceActive
        await sendWarning(profile.email, profile.full_name, daysRemaining)
        results.push({ user: profile.email, action: 'warning_sent', daysRemaining })
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})

async function triggerDelivery(userId: string, userEmail: string) {
  // Get all vault entries for this user
  const { data: entries } = await supabase
    .from('vault_entries')
    .select('id, title, format')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (!entries) return

  for (const entry of entries) {
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

      // Log the delivery event
      await supabase.from('delivery_events').insert({
        vault_entry_id: entry.id,
        recipient_id: recipient.id,
        delivered_at: new Date().toISOString(),
        status: 'delivered',
      })
    }

    // Mark entry as delivered
    await supabase.from('vault_entries')
      .update({ status: 'delivered' })
      .eq('id', entry.id)
  }
}

async function sendWarning(email: string, name: string, daysRemaining: number) {
  // Log warning - email will be sent via Resend later
  console.log(`Warning: ${email} has ${daysRemaining} days before vault delivery`)
  // TODO: integrate Resend for actual email sending
}
