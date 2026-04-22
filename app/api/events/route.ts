import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { generateShortCode } from "@/lib/shortCodeGenerator";
import { EVENT_TYPES } from "@/lib/eventVaultConstants";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      event_type,
      event_name,
      event_date,
      guest_message,
      allow_gifts,
      submission_deadline,
      auto_close_on_event_date,
      delivery_date,
      thank_you_message,
    } = body;

    // Validate
    if (!event_type || !EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
    if (!event_name || event_name.trim().length === 0) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }

    // Generate unique short code
    let short_code = generateShortCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("event_vaults")
        .select("id")
        .eq("short_code", short_code)
        .maybeSingle();
      if (!existing) break;
      short_code = generateShortCode();
      attempts++;
    }

    // Insert event vault
    const { data: event, error: insertError } = await supabase
      .from("event_vaults")
      .insert({
        host_user_id: profile.id,
        event_type,
        event_name: event_name.trim(),
        event_date: event_date || null,
        guest_message: guest_message || null,
        short_code,
        allow_gifts: allow_gifts || false,
        submission_deadline: submission_deadline || null,
        auto_close_on_event_date: auto_close_on_event_date || false,
        delivery_date: delivery_date || null,
        thank_you_message: thank_you_message || null,
        status: "active",
      })
      .select()
      .single();

    if (insertError || !event) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    // Generate QR code
    const guestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/e/${short_code}`;
    let qr_code_url: string | null = null;

    try {
      const qrDataUrl = await QRCode.toDataURL(guestUrl, {
        width: 400,
        margin: 2,
        color: { dark: "#2B1E1A", light: "#FFFFFF" },
      });

      // Upload QR to Supabase storage
      const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
      const qrPath = `events/qr/${short_code}.png`;

      const { error: uploadError } = await supabase.storage
        .from("event-vault")
        .upload(qrPath, qrBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("event-vault")
          .getPublicUrl(qrPath);
        qr_code_url = publicUrl.publicUrl;

        // Update event with QR URL
        await supabase
          .from("event_vaults")
          .update({ qr_code_url })
          .eq("id", event.id);
      }
    } catch (qrError) {
      console.error("QR generation error:", qrError);
      // Non-fatal — event still created
    }

    return NextResponse.json({
      ...event,
      qr_code_url,
      guest_url: guestUrl,
    });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: events, error } = await supabase
      .from("event_vaults")
      .select(`
        *,
        event_submissions(count),
        event_gifts(amount, status)
      `)
      .eq("host_user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    const eventsWithStats = (events || []).map((ev: any) => ({
      ...ev,
      submission_count: ev.event_submissions?.[0]?.count || 0,
      total_gifts: (ev.event_gifts || [])
        .filter((g: any) => g.status === "completed")
        .reduce((sum: number, g: any) => sum + Number(g.amount), 0),
      event_submissions: undefined,
      event_gifts: undefined,
    }));

    return NextResponse.json(eventsWithStats);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
