import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

async function getEventAndVerifyOwnership(
  supabase: any,
  eventId: string,
  profileId: string
) {
  const { data: event, error } = await supabase
    .from("event_vaults")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) return { event: null, error: "Event not found" };
  if (event.host_user_id !== profileId) return { event: null, error: "Forbidden" };
  return { event, error: null };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { event, error } = await getEventAndVerifyOwnership(
      supabase,
      id,
      profile.id
    );

    if (error || !event) {
      return NextResponse.json(
        { error: error || "Not found" },
        { status: error === "Forbidden" ? 403 : 404 }
      );
    }

    // Fetch submissions
    const { data: submissions } = await supabase
      .from("event_submissions")
      .select("*")
      .eq("event_vault_id", id)
      .order("submitted_at", { ascending: false });

    // Fetch gifts
    const { data: gifts } = await supabase
      .from("event_gifts")
      .select("*")
      .eq("event_vault_id", id)
      .order("created_at", { ascending: false });

    const total_gifts = (gifts || [])
      .filter((g: any) => g.status === "completed")
      .reduce((sum: number, g: any) => sum + Number(g.amount), 0);

    return NextResponse.json({
      ...event,
      submissions: submissions || [],
      gifts: gifts || [],
      submission_count: (submissions || []).length,
      total_gifts,
    });
  } catch (err) {
    console.error("GET /api/events/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { event, error } = await getEventAndVerifyOwnership(
      supabase,
      id,
      profile.id
    );

    if (error || !event) {
      return NextResponse.json(
        { error: error || "Not found" },
        { status: error === "Forbidden" ? 403 : 404 }
      );
    }

    const body = await req.json();

    // Only allow safe fields to be updated
    const allowedFields = [
      "event_name",
      "guest_message",
      "event_date",
      "submission_deadline",
      "allow_gifts",
      "status",
      "thank_you_message",
      "delivery_date",
      "auto_close_on_event_date",
    ];

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("event_vaults")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/events/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { event, error } = await getEventAndVerifyOwnership(
      supabase,
      id,
      profile.id
    );

    if (error || !event) {
      return NextResponse.json(
        { error: error || "Not found" },
        { status: error === "Forbidden" ? 403 : 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("event_vaults")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
