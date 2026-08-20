const base = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const res = await fetch(`${base}/api/signals/paper`, { cache: "no-store" });