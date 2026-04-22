import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = createClient();

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from("event_vaults")
      .select("id, status, allow_gifts, stripe_account_id, platform_fee_percent, event_name")
      .eq("short_code", params.code)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "active") {
      return NextResponse.json({ error: "This event is no longer active" }, { status: 410 });
    }

    if (!event.allow_gifts) {
      return NextResponse.json({ error: "Gifts are not enabled for this event" }, { status: 400 });
    }

    if (!event.stripe_account_id) {
      return NextResponse.json({ error: "Host has not connected a payment account" }, { status: 400 });
    }

    const body = await req.json();
    const { amount, submission_id } = body;

    // Validate amount — minimum $1, maximum $10,000
    if (!amount || amount < 1 || amount > 10000) {
      return NextResponse.json({ error: "Invalid gift amount" }, { status: 400 });
    }

    const amountInCents = Math.round(amount * 100);
    const feePercent = event.platform_fee_percent || 5;
    const platformFee = Math.round(amountInCents * (feePercent / 100));

    // Create Stripe payment intent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: event.stripe_account_id,
      },
      metadata: {
        event_name: event.event_name,
        short_code: params.code,
        submission_id: submission_id || "",
      },
    });

    // Insert pending gift record
    const { data: gift, error: giftError } = await supabase
      .from("event_gifts")
      .insert({
        event_vault_id: event.id,
        submission_id: submission_id || null,
        amount: amount,
        currency: "usd",
        platform_fee: platformFee / 100,
        net_amount: (amountInCents - platformFee) / 100,
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending",
      })
      .select()
      .single();

    if (giftError) {
      console.error("Gift insert error:", giftError);
      return NextResponse.json({ error: "Failed to create gift record" }, { status: 500 });
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      gift_id: gift.id,
      amount,
      platform_fee: platformFee / 100,
      net_amount: (amountInCents - platformFee) / 100,
    });
  } catch (err) {
    console.error("POST gifts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
