import { NextRequest, NextResponse } from "next/server";
import {
  redis,
  SIGNALS_KEY,
  ACCOUNT_KEY,
  MAX_STORED_SIGNALS,
  Signal,
  getStoredSignals,
  getAccount,
  applySignalToAccount,
} from "@/lib/redis";

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

  // Store the raw signal in the log.
  const existing = await getStoredSignals();
  const updated = [signal, ...existing].slice(0, MAX_STORED_SIGNALS);
  await redis.set(SIGNALS_KEY, updated);

  // Apply the signal to the account state (opens/closes positions, updates equity).
  const currentAccount = await getAccount();
  const newAccount = applySignalToAccount(currentAccount, signal);
  await redis.set(ACCOUNT_KEY, newAccount);

  return NextResponse.json({ status: "received", signal, account: newAccount });
}

export async function GET() {
  const signals = await getStoredSignals();
  const account = await getAccount();
  return NextResponse.json({ signals, account });
}
