import { NextRequest, NextResponse } from "next/server";
import {
  redis,
  SIGNALS_KEY,
  ACCOUNT_KEY,
  DEBUG_KEY,
  STARTING_EQUITY,
} from "@/lib/redis";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // No body is fine for this endpoint - secret can also come via query param below.
  }

  const providedSecret =
    body.secret || req.nextUrl.searchParams.get("secret") || "";

  if (WEBHOOK_SECRET && providedSecret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  await redis.set(SIGNALS_KEY, []);
  await redis.set(ACCOUNT_KEY, {
    equity: STARTING_EQUITY,
    position: null,
    closedTrades: [],
  });
  await redis.set(DEBUG_KEY, []);

  return NextResponse.json({
    status: "reset complete",
    equity: STARTING_EQUITY,
  });
}