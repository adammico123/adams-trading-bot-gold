import { Redis } from "@upstash/redis";

// Shared Redis client, used directly by both the API route (for writes)
// and the page component (for reads) - this avoids the page having to
// make a fragile internal HTTP call to its own API route.

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const SIGNALS_KEY = "paper:signals";
export const ACCOUNT_KEY = "paper:account";
export const DEBUG_KEY = "paper:debug_log";
export const MAX_STORED_SIGNALS = 200;

// Gold futures (GC) point value: a $1 move in price = $100 P&L per contract.
// This matches the sizing math used in the Pine Script strategy.
export const POINT_VALUE = 100;
export const STARTING_EQUITY = 25000;

export type Signal = {
  receivedAt: string;
  ticker: string;
  action: string;
  quantity?: number;
  price?: number;
  note?: string;
};

export type OpenPosition = {
  ticker: string;
  quantity: number;
  entryPrice: number;
  openedAt: string;
} | null;

export type ClosedTrade = {
  ticker: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  openedAt: string;
  closedAt: string;
};

export type Account = {
  equity: number;
  position: OpenPosition;
  closedTrades: ClosedTrade[];
};

const DEFAULT_ACCOUNT: Account = {
  equity: STARTING_EQUITY,
  position: null,
  closedTrades: [],
};

export async function getStoredSignals(): Promise<Signal[]> {
  try {
    return (await redis.get<Signal[]>(SIGNALS_KEY)) || [];
  } catch (err) {
    console.error("Failed to read signals from Redis:", err);
    return [];
  }
}

export async function getAccount(): Promise<Account> {
  try {
    const account = await redis.get<Account>(ACCOUNT_KEY);
    return account || DEFAULT_ACCOUNT;
  } catch (err) {
    console.error("Failed to read account from Redis:", err);
    return DEFAULT_ACCOUNT;
  }
}

// Applies one incoming signal to the account state and returns the updated
// account. This is the core paper-trading simulation logic:
// - "buy" with no open position: opens a new position at the signal's price.
// - "buy" while a position is already open: ignored (strategy never
//   pyramids - matches the Pine script's strategy.position_size == 0 gate).
// - "exit" while a position is open: closes it, realizes P&L into equity,
//   and records a closed trade.
// - "exit" with no open position: ignored (nothing to close).
export function applySignalToAccount(
  account: Account,
  signal: Signal
): Account {
  const { ticker, action, quantity, price } = signal;

  if (action === "buy") {
    if (account.position) {
      // Already in a position - this strategy doesn't add to winners.
      return account;
    }
    if (!quantity || !price) {
      // Can't open a position without knowing size and entry price.
      return account;
    }
    return {
      ...account,
      position: {
        ticker,
        quantity,
        entryPrice: price,
        openedAt: signal.receivedAt,
      },
    };
  }

  if (action === "exit") {
    if (!account.position || !price) {
      // Nothing open to close, or no exit price given.
      return account;
    }
    const { quantity: qty, entryPrice, openedAt } = account.position;
    const pnl = (price - entryPrice) * qty * POINT_VALUE;

    const closedTrade: ClosedTrade = {
      ticker: account.position.ticker,
      quantity: qty,
      entryPrice,
      exitPrice: price,
      pnl,
      openedAt,
      closedAt: signal.receivedAt,
    };

    return {
      equity: account.equity + pnl,
      position: null,
      closedTrades: [closedTrade, ...account.closedTrades].slice(0, 100),
    };
  }

  return account;
}
