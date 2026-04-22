import { NextResponse } from "next/server";
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
