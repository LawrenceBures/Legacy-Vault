import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

type StartVaultPayload = {
  recipientName?: string;
  recipientEmail?: string;
  messageType?: string;
  messageText?: string;
  deliveryRule?: string;
  email?: string;
  fullName?: string;
};

const INACTIVITY_DAYS_BY_RULE: Record<string, number> = {
  "30_days_inactive": 30,
  "60_days_inactive": 60,
  "90_days_inactive": 90,
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as StartVaultPayload;
    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createClient();
    const now = new Date().toISOString();
    const deliveryConfig = getDeliveryConfig(payload.deliveryRule!);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_id: userId,
          email: payload.email || null,
          full_name: payload.fullName || null,
          plan: "starter_founder",
          has_completed_onboarding: true,
          last_active: now,
        },
        { onConflict: "clerk_id" }
      )
      .select("id")
      .single();

    if (profileError || !profile) {
      throw profileError || new Error("Profile write failed.");
    }

    const { data: entry, error: entryError } = await supabase
      .from("vault_entries")
      .insert({
        user_id: profile.id,
        title: "My first legacy message",
        message_content: payload.messageText!.trim(),
        format: payload.messageType || "text",
        status: "active",
        delivery_trigger: deliveryConfig.entryTrigger,
        inactivity_days: deliveryConfig.inactivityDays,
      })
      .select("id, title")
      .single();

    if (entryError || !entry) {
      throw entryError || new Error("Vault entry write failed.");
    }

    const { data: recipient, error: recipientError } = await supabase
      .from("recipients")
      .insert({
        user_id: profile.id,
        name: payload.recipientName!.trim(),
        email: payload.recipientEmail!.trim(),
        relationship: "Other",
      })
      .select("id, name, email")
      .single();

    if (recipientError || !recipient) {
      throw recipientError || new Error("Recipient write failed.");
    }

    const { error: linkError } = await supabase.from("vault_entry_recipients").insert({
      vault_entry_id: entry.id,
      recipient_id: recipient.id,
    });

    if (linkError) {
      throw linkError;
    }

    const { error: settingsError } = await supabase
      .from("delivery_settings")
      .upsert(
        {
          user_id: profile.id,
          inactivity_enabled: deliveryConfig.entryTrigger === "inactivity",
          time_window_days: deliveryConfig.inactivityDays,
          unlock_enabled: deliveryConfig.entryTrigger === "unlock",
          updated_at: now,
        },
        { onConflict: "user_id" }
      );

    if (settingsError) {
      throw settingsError;
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      entryId: entry.id,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      deliveryRule: payload.deliveryRule,
      deliveryTrigger: deliveryConfig.entryTrigger,
      inactivityDays: deliveryConfig.inactivityDays,
    });
  } catch (err) {
    console.error("start-vault persistence error raw:", err);
    console.error("start-vault persistence error json:", JSON.stringify(err, Object.getOwnPropertyNames(err || {}), 2));

    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null
        ? JSON.stringify(err)
        : String(err);

    return NextResponse.json(
      { error: errorMessage || "Failed to save vault data." },
      { status: 500 }
    );
  }
}

function validatePayload(payload: StartVaultPayload) {
  if (!payload.recipientName?.trim()) return "Recipient name is required.";
  if (!payload.recipientEmail?.trim()) return "Recipient email is required.";
  if (!/\S+@\S+\.\S+/.test(payload.recipientEmail)) {
    return "Recipient email is invalid.";
  }
  if (!payload.messageType) return "Message type is required.";
  if (payload.messageType !== "text") {
    return "Only text messages from /start can be persisted right now.";
  }
  if (!payload.messageText?.trim()) return "Message text is required.";
  if (!payload.deliveryRule) return "Delivery rule is required.";

  return null;
}

function getDeliveryConfig(deliveryRule: string) {
  if (deliveryRule in INACTIVITY_DAYS_BY_RULE) {
    return {
      entryTrigger: "inactivity",
      inactivityDays: INACTIVITY_DAYS_BY_RULE[deliveryRule],
    };
  }

  if (deliveryRule === "unlock_code") {
    return { entryTrigger: "unlock", inactivityDays: null };
  }

  return { entryTrigger: "custom", inactivityDays: null };
}
