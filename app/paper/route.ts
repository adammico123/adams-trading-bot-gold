import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// This route receives webhook POSTs from your TradingView alert.
// It validates the payload, stores it, and updates running stats -
// all real, not sample data, once TradingView is pointed here.
//
// Uses Upstash Redis via Vercel's Marketplace integration. The integration
// names its env vars KV_REST_API_URL / KV_REST_API_TOKEN (not the
// UPSTASH_REDIS_REST_* names Redis.fromEnv() looks for by default), so we
// pass them explicitly rather than relying on fromEnv()'s defaults.

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});


const SIGNALS_KEY = "paper:signals";
const STATS_KEY = "paper:stats";
const MAX_STORED_SIGNALS = 200;

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

type Signal = {
  receivedAt: string;
  ticker: string;
  action: string;
  quantity?: number;
  price?: number;
  note?: string;
};

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

  // Push onto a capped list of recent signals (most recent first).
  const existing = (await redis.get<Signal[]>(SIGNALS_KEY)) || [];
  const updated = [signal, ...existing].slice(0, MAX_STORED_SIGNALS);
  await redis.set(SIGNALS_KEY, updated);

  return NextResponse.json({ status: "received", signal });
}

export async function GET() {
  const signals = (await redis.get<Signal[]>(SIGNALS_KEY)) || [];
  const stats = (await redis.get(STATS_KEY)) || null;
  return NextResponse.json({ signals, stats });
}
