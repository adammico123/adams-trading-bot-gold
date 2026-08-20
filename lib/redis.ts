import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const SIGNALS_KEY = "paper:signals";
export const STATS_KEY = "paper:stats";
export const MAX_STORED_SIGNALS = 200;

export type Signal = {
  receivedAt: string;
  ticker: string;
  action: string;
  quantity?: number;
  price?: number;
  note?: string;
};

export async function getStoredSignals(): Promise<Signal[]> {
  try {
    return (await redis.get<Signal[]>(SIGNALS_KEY)) || [];
  } catch (err) {
    console.error("Failed to read signals from Redis:", err);
    return [];
  }
}