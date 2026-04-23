import { NextRequest, NextResponse } from "next/server";
import { runDeliveryWorker } from "@/lib/deliveryWorker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runDeliveryWorker({
      dryRun: false,
      trigger: "all",
      limit: 25,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
