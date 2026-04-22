import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_LIMITS } from "@/lib/eventVaultConstants";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = createClient();
    const { code } = await params;

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from("event_vaults")
      .select("id, status, submission_deadline, thank_you_message, event_name, allow_gifts")
      .eq("short_code", code)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "active") {
      return NextResponse.json({ error: "This event is no longer accepting messages" }, { status: 410 });
    }

    if (event.submission_deadline) {
      if (new Date() > new Date(event.submission_deadline)) {
        return NextResponse.json({ error: "Submission deadline has passed" }, { status: 410 });
      }
    }

    const body = await req.json();
    const { guest_name, guest_email, message_type, text_content } = body;

    // Validate required fields
    if (!guest_name || guest_name.trim().length === 0) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }

    if (!message_type || !["text", "audio", "video"].includes(message_type)) {
      return NextResponse.json({ error: "Invalid message type" }, { status: 400 });
    }

    // Validate text content
    if (message_type === "text") {
      if (!text_content || text_content.trim().length === 0) {
        return NextResponse.json({ error: "Message content is required" }, { status: 400 });
      }
      if (text_content.length > MEDIA_LIMITS.text.maxChars) {
        return NextResponse.json(
          { error: `Message cannot exceed ${MEDIA_LIMITS.text.maxChars} characters` },
          { status: 400 }
        );
      }
    }

    // Insert submission
    const { data: submission, error: insertError } = await supabase
      .from("event_submissions")
      .insert({
        event_vault_id: event.id,
        guest_name: guest_name.trim(),
        guest_email: guest_email?.trim() || null,
        message_type,
        text_content: message_type === "text" ? text_content.trim() : null,
        review_status: "approved",
      })
      .select()
      .single();

    if (insertError || !submission) {
      console.error("Submission insert error:", insertError);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // Send guest confirmation email if email provided
    if (guest_email && process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Event Vault <noreply@eventvault.co>",
            to: guest_email,
            subject: `Your message was saved for ${event.event_name}`,
            html: `
              <div style="font-family:'DM Sans',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2B1E1A">
                <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;margin-bottom:8px">
                  Your message is safe. ✦
                </h1>
                <p style="font-size:15px;color:#6B6B6B;line-height:1.7;margin-bottom:24px">
                  Thank you, ${guest_name}. Your message for <strong>${event.event_name}</strong> has been saved and will be delivered to the host on the date they choose.
                </p>
                ${event.thank_you_message ? `
                <div style="border-left:3px solid #D66A4E;padding-left:16px;margin-bottom:24px">
                  <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#2B1E1A;line-height:1.6">
                    "${event.thank_you_message}"
                  </p>
                </div>` : ""}
                <p style="font-size:13px;color:#6B6B6B">
                  Powered by <a href="https://eventvault.co" style="color:#D66A4E;text-decoration:none">Event Vault</a>
                </p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Guest confirmation email error:", emailError);
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      thank_you_message: event.thank_you_message,
    });
  } catch (err) {
    console.error("POST submissions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
