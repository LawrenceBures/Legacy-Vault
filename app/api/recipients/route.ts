import { NextRequest, NextResponse } from "next/server";
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

    const { data: recipients, error: recipientsError } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (recipientsError) {
      throw recipientsError;
    }

    return NextResponse.json(recipients || []);
  } catch (err: any) {
    console.error("GET /api/recipients error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, relationship } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
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

    const { data: recipient, error: insertError } = await supabase
      .from("recipients")
      .insert({
        user_id: profile.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        relationship: relationship || "Other",
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(recipient);
  } catch (err: any) {
    console.error("POST /api/recipients error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, email, phone, relationship } = body;

    if (!id) {
      return NextResponse.json({ error: "Recipient ID is required." }, { status: 400 });
    }
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
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

    // Verify ownership
    const { data: existing } = await supabase
      .from("recipients")
      .select("id")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("recipients")
      .update({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        relationship: relationship || "Other",
      })
      .eq("id", id)
      .eq("user_id", profile.id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/recipients error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("id");

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required." },
        { status: 400 }
      );
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

    // Verify ownership before deleting
    const { data: existing } = await supabase
      .from("recipients")
      .select("id")
      .eq("id", recipientId)
      .eq("user_id", profile.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Remove from junction table first
    await supabase
      .from("vault_entry_recipients")
      .delete()
      .eq("recipient_id", recipientId);

    const { error: deleteError } = await supabase
      .from("recipients")
      .delete()
      .eq("id", recipientId)
      .eq("user_id", profile.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/recipients error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
