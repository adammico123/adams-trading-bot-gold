import { NextResponse } from "next/server";
import { redis, DEBUG_KEY } from "@/lib/redis";

export async function GET() {
  const entries = (await redis.get<string[]>(DEBUG_KEY)) || [];
  return NextResponse.json({ entries });
}