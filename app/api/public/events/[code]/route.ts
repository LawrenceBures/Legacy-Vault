import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = createClient();
    const { code } = await params;

    const { data: event, error } = await supabase
      .from("event_vaults")
      .select(`
        id,
        event_type,
        event_name,
        event_date,
        guest_message,
        short_code,
        status,
        allow_gifts,
        submission_deadline,
        thank_you_message,
        event_submissions(count)
      `)
      .eq("short_code", code)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is active
    if (event.status === "closed" || event.status === "delivered") {
      return NextResponse.json({ error: "This event is no longer accepting messages" }, { status: 410 });
    }

    // Check submission deadline
    if (event.submission_deadline) {
      const deadline = new Date(event.submission_deadline);
      if (new Date() > deadline) {
        return NextResponse.json({ error: "Submission deadline has passed" }, { status: 410 });
      }
    }

    // Return only safe public fields — never host_user_id or stripe_account_id
    return NextResponse.json({
      id: event.id,
      event_type: event.event_type,
      event_name: event.event_name,
      event_date: event.event_date,
      guest_message: event.guest_message,
      short_code: event.short_code,
      status: event.status,
      allow_gifts: event.allow_gifts,
      submission_deadline: event.submission_deadline,
      thank_you_message: event.thank_you_message,
      submission_count: (event as any).event_submissions?.[0]?.count || 0,
    });
  } catch (err) {
    console.error("GET /api/public/events/[code] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
