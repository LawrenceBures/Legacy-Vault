import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    const { data: entries, error: entriesError } = await supabase
      .from("vault_entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (entriesError) {
      throw entriesError;
    }

    return NextResponse.json(entries || []);
  } catch (err: any) {
    console.error("GET /api/vault/entries error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
