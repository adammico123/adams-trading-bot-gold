import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const SIGNALS_KEY = "paper:signals";
export const ACCOUNT_KEY = "paper:account";
export const DEBUG_KEY = "paper:debug_log";
export const MAX_STORED_SIGNALS = 200;

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

export function applySignalToAccount(
  account: Account,
  signal: Signal
): Account {
  const { ticker, action, quantity, price } = signal;

  if (action === "buy") {
    if (account.position) {
      return account;
    }
    if (!quantity || !price) {
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

  // "exit" or "sell" both mean "close the open position" - the strategy's
  // webhook sends "sell" (via {{strategy.order.action}}) for a closing
  // order, so both need to be treated identically here.
  if (action === "exit" || action === "sell") {
    if (!account.position || !price) {
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