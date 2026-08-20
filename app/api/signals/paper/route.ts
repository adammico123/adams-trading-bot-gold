import { NextRequest, NextResponse } from "next/server";
import { redis, SIGNALS_KEY, STATS_KEY, MAX_STORED_SIGNALS, Signal, getStoredSignals } from "@/lib/redis";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (WEBHOOK_SECRET && body.secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  if (!body.ticker || !body.action) {
    return NextResponse.json(
      { error: "ticker and action are required" },
      { status: 400 }
    );
  }

  const validActions = ["buy", "sell", "exit"];
  if (!validActions.includes(String(body.action))) {
    return NextResponse.json(
      { error: `action must be one of ${validActions.join(", ")}` },
      { status: 400 }
    );
  }

  const signal: Signal = {
    receivedAt: new Date().toISOString(),
    ticker: String(body.ticker),
    action: String(body.action),
    quantity: typeof body.quantity === "number" ? body.quantity : undefined,
    price: typeof body.price === "number" ? body.price : undefined,
    note: typeof body.note === "string" ? body.note : undefined,
  };

  const existing = await getStoredSignals();
  const updated = [signal, ...existing].slice(0, MAX_STORED_SIGNALS);
  await redis.set(SIGNALS_KEY, updated);

  return NextResponse.json({ status: "received", signal });
}

export async function GET() {
  const signals = await getStoredSignals();
  const stats = (await redis.get(STATS_KEY)) || null;
  return NextResponse.json({ signals, stats });
}