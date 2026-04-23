import { NextRequest, NextResponse } from "next/server";
import { runDeliveryWorker } from "@/lib/deliveryWorker";

export async function GET(req: NextRequest) {
  return handleDeliveryWorkerRequest(req);
}

export async function POST(req: NextRequest) {
  return handleDeliveryWorkerRequest(req);
}

async function handleDeliveryWorkerRequest(req: NextRequest) {
  const unauthorized = authorizeWorkerRequest(req);
  if (unauthorized) return unauthorized;

  try {
    const body =
      req.method === "POST"
        ? await req.json().catch(() => ({}))
        : Object.fromEntries(req.nextUrl.searchParams.entries());

    const result = await runDeliveryWorker({
      dryRun: body.dryRun === true || body.dryRun === "true",
      limit: body.limit ? Number(body.limit) : undefined,
      trigger: normalizeTrigger(body.trigger),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("delivery worker error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

function authorizeWorkerRequest(req: NextRequest) {
  const workerSecret = process.env.DELIVERY_WORKER_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  if (!workerSecret && !cronSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "DELIVERY_WORKER_SECRET or CRON_SECRET must be configured in production." },
      { status: 500 }
    );
  }

  if (!workerSecret && !cronSecret) return null;

  const providedWorkerSecret =
    req.headers.get("x-delivery-worker-secret") || req.nextUrl.searchParams.get("secret");
  const authorization = req.headers.get("authorization");
  const providedCronSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (workerSecret && providedWorkerSecret === workerSecret) {
    return null;
  }

  if (cronSecret && providedCronSecret === cronSecret) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizeTrigger(value: unknown) {
  if (value === "inactivity" || value === "milestone" || value === "all") {
    return value;
  }

  return "all";
}
