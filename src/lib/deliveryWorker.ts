import { createClient } from "@/lib/supabase/server";

type TriggerFilter = "all" | "inactivity" | "milestone";

type DeliveryWorkerOptions = {
  dryRun?: boolean;
  limit?: number;
  trigger?: TriggerFilter;
};

type SupabaseServerClient = ReturnType<typeof createClient>;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  last_active: string | null;
};

type DeliverySettingRow = {
  user_id: string;
  time_window_days: number | null;
};

type VaultEntryRow = {
  id: string;
  user_id: string;
  title: string | null;
  message_content: string | null;
  format: string | null;
  media_url: string | null;
  status: string | null;
  delivery_trigger: string | null;
  inactivity_days: number | null;
};

type RecipientRow = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
};

type MilestoneRow = {
  id: string;
  user_id: string;
  vault_entry_id: string;
  milestone_date: string;
  milestone_label: string | null;
  status: string | null;
};

type ProfileDue = {
  profile: ProfileRow;
  thresholdDays: number;
  daysInactive: number;
};

type AssignmentRow = {
  recipient_id: string;
};

type ClaimRpcRow = {
  claimed: boolean;
  existing_status: string | null;
};

type DeliveryCandidate = {
  triggerType: "inactivity" | "milestone";
  triggerId: string;
  entry: VaultEntryRow;
  profile: ProfileRow | null;
  dueReason: string;
  milestone?: MilestoneRow;
};

type RecipientDeliveryResult = {
  recipientId: string;
  recipientEmail: string | null;
  idempotencyKey: string;
  status:
    | "would_send"
    | "claimed"
    | "delivered"
    | "duplicate_skipped"
    | "failed";
  emailProviderId?: string | null;
  error?: string;
};

type CandidateResult = {
  triggerType: DeliveryCandidate["triggerType"];
  triggerId: string;
  vaultEntryId: string;
  vaultEntryTitle: string | null;
  dueReason: string;
  status: "processed" | "skipped" | "failed";
  skipReason?: string;
  recipients: RecipientDeliveryResult[];
};

const DEFAULT_LIMIT = 25;

export async function runDeliveryWorker(options: DeliveryWorkerOptions = {}) {
  const supabase = createClient();
  const trigger = options.trigger || "all";
  const limit = Math.max(1, Math.min(options.limit || DEFAULT_LIMIT, 100));
  const dryRun = options.dryRun === true;

  const candidates = await findDueDeliveries(supabase, trigger);
  const limitedCandidates = candidates.slice(0, limit);
  const results: CandidateResult[] = [];

  for (const candidate of limitedCandidates) {
    results.push(await processCandidate(supabase, candidate, dryRun));
  }

  return {
    ok: true,
    dryRun,
    trigger,
    scanned: candidates.length,
    processed: results.length,
    remaining: Math.max(candidates.length - limitedCandidates.length, 0),
    summary: summarizeResults(results),
    results,
  };
}

async function findDueDeliveries(supabase: SupabaseServerClient, trigger: TriggerFilter) {
  const candidates: DeliveryCandidate[] = [];

  if (trigger === "all" || trigger === "inactivity") {
    candidates.push(...(await findDueInactivityDeliveries(supabase)));
  }

  if (trigger === "all" || trigger === "milestone") {
    candidates.push(...(await findDueMilestoneDeliveries(supabase)));
  }

  return candidates;
}

async function findDueInactivityDeliveries(supabase: SupabaseServerClient) {
  const { data: settings, error: settingsError } = await supabase
    .from("delivery_settings")
    .select("user_id, time_window_days")
    .eq("inactivity_enabled", true);

  if (settingsError) throw settingsError;
  if (!settings?.length) return [];

  const userIds = settings.map((setting: DeliverySettingRow) => setting.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, last_active")
    .in("id", userIds);

  if (profilesError) throw profilesError;
  if (!profiles?.length) return [];

  const now = new Date();
  const settingsByUser = new Map<string, DeliverySettingRow>(
    settings.map((setting: DeliverySettingRow) => [setting.user_id, setting])
  );
  const dueProfiles = profiles
    .map((profile: ProfileRow) => {
      const setting = settingsByUser.get(profile.id);
      const thresholdDays = setting?.time_window_days || 60;
      const lastActive = new Date(profile.last_active || now.toISOString());
      const daysInactive = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      return { profile, thresholdDays, daysInactive };
    })
    .filter(({ daysInactive, thresholdDays }: ProfileDue) => daysInactive >= thresholdDays);

  if (!dueProfiles.length) return [];

  const dueUserIds = dueProfiles.map(({ profile }: ProfileDue) => profile.id);
  const { data: entries, error: entriesError } = await supabase
    .from("vault_entries")
    .select(
      "id, user_id, title, message_content, format, media_url, status, delivery_trigger, inactivity_days"
    )
    .in("user_id", dueUserIds)
    .eq("status", "active");

  if (entriesError) throw entriesError;
  if (!entries?.length) return [];

  const profileDueById = new Map<string, ProfileDue>(
    dueProfiles.map((due: ProfileDue) => [due.profile.id, due])
  );

  return entries
    .filter(
      (entry: VaultEntryRow) =>
        entry.delivery_trigger === "inactivity" && profileDueById.has(entry.user_id)
    )
    .map((entry: VaultEntryRow) => {
      const due = profileDueById.get(entry.user_id) as ProfileDue;
      return {
        triggerType: "inactivity" as const,
        triggerId: entry.user_id,
        entry,
        profile: due.profile,
        dueReason: `${due.daysInactive} days inactive; threshold ${due.thresholdDays} days`,
      };
    });
}

async function findDueMilestoneDeliveries(supabase: SupabaseServerClient) {
  const today = new Date().toISOString().split("T")[0];
  const { data: milestones, error: milestoneError } = await supabase
    .from("milestone_deliveries")
    .select("id, user_id, vault_entry_id, milestone_date, milestone_label, status")
    .lte("milestone_date", today)
    .eq("status", "scheduled");

  if (milestoneError) throw milestoneError;
  if (!milestones?.length) return [];

  const entryIds = milestones.map((milestone: MilestoneRow) => milestone.vault_entry_id);
  const userIds = milestones.map((milestone: MilestoneRow) => milestone.user_id);

  const [{ data: entries, error: entriesError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("vault_entries")
        .select(
          "id, user_id, title, message_content, format, media_url, status, delivery_trigger, inactivity_days"
        )
        .in("id", entryIds),
      supabase.from("profiles").select("id, email, full_name, last_active").in("id", userIds),
    ]);

  if (entriesError) throw entriesError;
  if (profilesError) throw profilesError;

  const entriesById = new Map<string, VaultEntryRow>(
    (entries || []).map((entry: VaultEntryRow) => [entry.id, entry])
  );
  const profilesById = new Map<string, ProfileRow>(
    (profiles || []).map((profile: ProfileRow) => [profile.id, profile])
  );

  return milestones
    .map((milestone: MilestoneRow) => {
      const entry = entriesById.get(milestone.vault_entry_id);
      if (!entry) return null;

      return {
        triggerType: "milestone" as const,
        triggerId: milestone.id,
        entry,
        profile: profilesById.get(milestone.user_id) || null,
        milestone,
        dueReason: `milestone due on ${milestone.milestone_date}`,
      };
    })
    .filter(Boolean) as DeliveryCandidate[];
}

async function processCandidate(
  supabase: SupabaseServerClient,
  candidate: DeliveryCandidate,
  dryRun: boolean
): Promise<CandidateResult> {
  const recipients = await resolveAssignedRecipients(supabase, candidate.entry);

  if (!recipients.length) {
    return {
      triggerType: candidate.triggerType,
      triggerId: candidate.triggerId,
      vaultEntryId: candidate.entry.id,
      vaultEntryTitle: candidate.entry.title,
      dueReason: candidate.dueReason,
      status: "skipped",
      skipReason: "No assigned recipients found in vault_entry_recipients.",
      recipients: [],
    };
  }

  const recipientResults: RecipientDeliveryResult[] = [];

  for (const recipient of recipients) {
    const idempotencyKey = buildIdempotencyKey(candidate, recipient);

    if (!recipient.email) {
      recipientResults.push({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        idempotencyKey,
        status: "failed",
        error: "Recipient has no email address.",
      });
      continue;
    }

    if (dryRun) {
      recipientResults.push({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        idempotencyKey,
        status: "would_send",
      });
      continue;
    }

    const claim = await claimDeliveryEvent(supabase, candidate, recipient, idempotencyKey);
    if (!claim.claimed) {
      recipientResults.push({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        idempotencyKey,
        status: "duplicate_skipped",
        error: `Existing delivery_event status: ${claim.existingStatus}`,
      });
      continue;
    }

    try {
      const emailResult = await sendVaultReleaseEmail(candidate, recipient, idempotencyKey);
      const markedDelivered = await markDeliveryEventDelivered(
        supabase,
        idempotencyKey,
        emailResult.providerId
      );

      if (!markedDelivered) {
        throw new Error("Email sent but delivery_event could not be marked delivered.");
      }

      recipientResults.push({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        idempotencyKey,
        status: "delivered",
        emailProviderId: emailResult.providerId,
      });
    } catch (err) {
      const message = formatError(err);
      await markDeliveryEventFailed(supabase, idempotencyKey, message);
      recipientResults.push({
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        idempotencyKey,
        status: "failed",
        error: message,
      });
    }
  }

  await finalizeDeliveryIfComplete(supabase, candidate);

  const hasFailure = recipientResults.some((result) => result.status === "failed");
  const hasProcessed = recipientResults.some((result) => result.status === "delivered");

  return {
    triggerType: candidate.triggerType,
    triggerId: candidate.triggerId,
    vaultEntryId: candidate.entry.id,
    vaultEntryTitle: candidate.entry.title,
    dueReason: candidate.dueReason,
    status: hasFailure && !hasProcessed ? "failed" : "processed",
    recipients: recipientResults,
  };
}

async function resolveAssignedRecipients(supabase: SupabaseServerClient, entry: VaultEntryRow) {
  const { data: assignments, error: assignmentError } = await supabase
    .from("vault_entry_recipients")
    .select("recipient_id")
    .eq("vault_entry_id", entry.id);

  if (assignmentError) throw assignmentError;
  if (!assignments?.length) return [];

  const recipientIds = (assignments as AssignmentRow[]).map(
    (assignment) => assignment.recipient_id
  );
  const { data: recipients, error: recipientsError } = await supabase
    .from("recipients")
    .select("id, user_id, name, email")
    .eq("user_id", entry.user_id)
    .in("id", recipientIds);

  if (recipientsError) throw recipientsError;
  return (recipients || []) as RecipientRow[];
}

async function claimDeliveryEvent(
  supabase: SupabaseServerClient,
  candidate: DeliveryCandidate,
  recipient: RecipientRow,
  idempotencyKey: string
) {
  const { data, error } = await supabase.rpc("claim_delivery_event", {
    p_vault_entry_id: candidate.entry.id,
    p_recipient_id: recipient.id,
    p_trigger_type: candidate.triggerType,
    p_trigger_id: candidate.triggerId,
    p_idempotency_key: idempotencyKey,
    p_recipient_email: recipient.email,
    p_recipient_name: recipient.name,
  });

  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as ClaimRpcRow | null;
  return {
    claimed: row?.claimed === true,
    existingStatus: row?.existing_status || "unknown",
  };
}

async function markDeliveryEventDelivered(
  supabase: SupabaseServerClient,
  idempotencyKey: string,
  providerId: string | null
) {
  const { data, error } = await supabase.rpc("mark_delivery_event_delivered", {
    p_idempotency_key: idempotencyKey,
    p_email_provider: "resend",
    p_email_provider_id: providerId,
  });

  if (error) throw error;
  return data === true;
}

async function markDeliveryEventFailed(
  supabase: SupabaseServerClient,
  idempotencyKey: string,
  errorMessage: string
) {
  const { error } = await supabase.rpc("mark_delivery_event_failed", {
    p_idempotency_key: idempotencyKey,
    p_error_message: errorMessage,
  });

  if (error) throw error;
}

async function finalizeDeliveryIfComplete(
  supabase: SupabaseServerClient,
  candidate: DeliveryCandidate
) {
  const { error } = await supabase.rpc("finalize_delivery_if_complete", {
    p_vault_entry_id: candidate.entry.id,
    p_trigger_type: candidate.triggerType,
    p_trigger_id: candidate.triggerId,
    p_milestone_id: candidate.milestone?.id || null,
  });

  if (error) throw error;
}

async function sendVaultReleaseEmail(
  candidate: DeliveryCandidate,
  recipient: RecipientRow,
  idempotencyKey: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  const subject = `A Legacy Vault message has been released: ${
    candidate.entry.title || "Untitled message"
  }`;
  const html = buildVaultReleaseHtml(candidate, recipient);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: "Legacy Vault <hello@joinlegacyvault.com>",
      to: recipient.email,
      subject,
      html,
    }),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Resend failed with ${res.status}: ${payload?.message || JSON.stringify(payload)}`
    );
  }

  return { providerId: payload?.id || null };
}

function buildVaultReleaseHtml(candidate: DeliveryCandidate, recipient: RecipientRow) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://joinlegacyvault.com";
  const entryTitle = escapeHtml(candidate.entry.title || "Untitled message");
  const recipientName = escapeHtml(recipient.name || "there");
  const senderName = escapeHtml(candidate.profile?.full_name || "Legacy Vault");
  const reason = escapeHtml(candidate.dueReason);
  const messageHtml = buildMessageHtml(candidate.entry);

  return `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;background:#F5F3EF;font-family:Arial,sans-serif;color:#1F2E23;">
    <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
      <div style="background:#1F2E23;border-radius:10px;padding:36px;text-align:center;margin-bottom:24px;">
        <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:300;color:#F5F3EF;margin:0 0 12px;">A Legacy Vault message has been released</h1>
        <p style="color:rgba(245,243,239,0.68);font-size:15px;line-height:1.7;margin:0;">
          Hi ${recipientName}, ${senderName} left this message for you.
        </p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:32px;border:1px solid rgba(31,46,35,0.08);">
        <p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#B89B5E;margin:0 0 10px;">Released message</p>
        <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;margin:0 0 18px;color:#1F2E23;">${entryTitle}</h2>
        ${messageHtml}
        <p style="font-size:12px;color:rgba(31,46,35,0.45);line-height:1.6;margin:24px 0 0;">Release reason: ${reason}</p>
      </div>
      <div style="text-align:center;padding:24px 0 0;">
        <a href="${siteUrl}" style="display:inline-block;padding:13px 28px;background:#B89B5E;color:#1F2E23;text-decoration:none;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Open Legacy Vault</a>
      </div>
    </div>
  </body>
</html>`;
}

function buildMessageHtml(entry: VaultEntryRow) {
  if (entry.format === "text" && entry.message_content) {
    return `<div style="font-family:Georgia,serif;font-size:18px;line-height:1.8;color:#1F2E23;white-space:pre-wrap;">${escapeHtml(
      entry.message_content
    )}</div>`;
  }

  const format = escapeHtml(entry.format || "message");
  return `<p style="font-size:15px;line-height:1.7;color:rgba(31,46,35,0.7);margin:0;">A ${format} message has been released from Legacy Vault. Secure recipient media access is not yet represented by a public route in this codebase.</p>`;
}

function buildIdempotencyKey(candidate: DeliveryCandidate, recipient: RecipientRow) {
  return [
    "legacy-vault",
    candidate.triggerType,
    candidate.triggerId,
    candidate.entry.id,
    recipient.id,
  ].join(":");
}

function summarizeResults(results: CandidateResult[]) {
  return results.reduce(
    (summary, result) => {
      summary[result.status] += 1;
      for (const recipient of result.recipients) {
        summary.recipientResults[recipient.status] += 1;
      }
      return summary;
    },
    {
      processed: 0,
      skipped: 0,
      failed: 0,
      recipientResults: {
        would_send: 0,
        claimed: 0,
        delivered: 0,
        duplicate_skipped: 0,
        failed: 0,
      },
    }
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatError(err: unknown) {
  if (err instanceof Error) return err.message;
  return String(err);
}
