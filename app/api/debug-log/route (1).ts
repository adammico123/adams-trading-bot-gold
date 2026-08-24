import { NextResponse } from "next/server";
import { redis, DEBUG_KEY } from "@/lib/redis";

// Temporary debugging endpoint - shows the raw text body of the last 20
// webhook requests received, exactly as sent, before any JSON parsing or
// validation. Used to diagnose why TradingView's webhook was getting
// rejected with 400 errors. Safe to delete once the issue is resolved.

export async function GET() {
  const entries = (await redis.get<string[]>(DEBUG_KEY)) || [];
  return NextResponse.json({ entries });
}
