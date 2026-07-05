import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { canUseVideo, canUseAudio, type Tier } from "@/lib/featureGating";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const entryType = String(formData.get("entryFormat") || formData.get("entryType") || "text").trim();
    const description = formData.get("description") as string | null;
    const email = String(formData.get("email") || "").trim() || null;
    const fullName = String(formData.get("full_name") || "").trim() || null;
    const file = formData.get("file");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!["text", "audio", "video"].includes(entryType)) {
      return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });
    }

    const supabase = createClient();

    // Ensure profile exists
    let { data: profile } = await supabase
      .from("profiles")
      .select("id, plan")
      .eq("clerk_id", userId)
      .single();

    if (!profile) {
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          clerk_id: userId,
          email,
          full_name: fullName,
          plan: "free",
        })
        .select("id, plan")
        .single();

      if (error) throw error;
      profile = newProfile;
    }

    // Server-side feature gating
    const userPlan = (profile.plan || "free") as Tier;
    if (entryType === "video" && !canUseVideo(userPlan)) {
      return NextResponse.json(
        { error: "Video messages require a Legacy plan or above." },
        { status: 403 }
      );
    }
    if (entryType === "audio" && !canUseAudio(userPlan)) {
      return NextResponse.json(
        { error: "Audio messages require a Basic plan or above." },
        { status: 403 }
      );
    }

    let mediaUrl: string | null = null;

    if ((entryType === "audio" || entryType === "video") && file instanceof File) {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
      const safeExt =
        ext ||
        (entryType === "audio"
          ? "webm"
          : entryType === "video"
          ? "webm"
          : "bin");

      const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("vault-media")
        .upload(filePath, fileBuffer, {
          contentType: file.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      mediaUrl = filePath;
    }

    const { error } = await supabase.from("vault_entries").insert({
      user_id: profile.id,
      title,
      message_content: message || null,
      description: description || null,
      format: entryType,
      media_url: mediaUrl,
      status: "active",
      delivery_trigger: "inactivity",
      inactivity_days: 60,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("save-entry error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
