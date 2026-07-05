import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: entry, error: entryError } = await supabase
      .from("vault_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (entryError || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { data: recipients, error: recipientsError } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", profile.id);

    if (recipientsError) {
      throw recipientsError;
    }

    const { data: assigned, error: assignedError } = await supabase
      .from("vault_entry_recipients")
      .select("recipient_id")
      .eq("vault_entry_id", id);

    if (assignedError) {
      throw assignedError;
    }

    return NextResponse.json({
      entry,
      recipients: recipients || [],
      assignedRecipients: (assigned || []).map((a: any) => a.recipient_id),
      profileId: profile.id,
    });
  } catch (err: any) {
    console.error("GET /api/vault/entries/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Handle recipient assignment
    if (body.assignRecipientIds !== undefined) {
      // Clear existing assignments
      await supabase
        .from("vault_entry_recipients")
        .delete()
        .eq("vault_entry_id", id);

      // Insert new assignments
      if (body.assignRecipientIds.length > 0) {
        const rows = body.assignRecipientIds.map((recipientId: string) => ({
          vault_entry_id: id,
          recipient_id: recipientId,
        }));
        const { error: linkError } = await supabase
          .from("vault_entry_recipients")
          .insert(rows);
        if (linkError) throw linkError;
      }
    }

    // Handle title/description update
    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.message_content !== undefined) updates.message_content = body.message_content;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("vault_entries")
        .update(updates)
        .eq("id", id)
        .eq("user_id", profile.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/vault/entries/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify ownership
    const { data: entry } = await supabase
      .from("vault_entries")
      .select("id")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Remove junction table entries first
    await supabase
      .from("vault_entry_recipients")
      .delete()
      .eq("vault_entry_id", id);

    // Delete the entry
    const { error: deleteError } = await supabase
      .from("vault_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", profile.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/vault/entries/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
