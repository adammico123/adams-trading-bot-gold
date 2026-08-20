# Adam's Trading Bot — Gold

A dashboard for automating the gold momentum-breakout strategy, with three modes:

- **Paper trading** — simulated fills, functional now
- **Live broker** — real broker execution, UI built, no broker connected yet
- **Funded account** — prop-firm rule guardrails on top of live execution, not connected yet

## Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploy online

The fastest path is Vercel (the company behind Next.js), free for this scale:

1. Push this folder to a GitHub repo
2. Go to vercel.com, sign in, click "New Project", import the repo
3. Leave all settings default and click Deploy
4. You'll get a live URL like `adams-trading-bot.vercel.app` within a minute or two

Alternatives: Netlify, Render, or Railway all support Next.js apps with a similarly simple import-and-deploy flow.

## What's real vs. placeholder right now

- **Paper trading page**: UI is complete. The stats and signal feed shown are sample data —
  connect it to your actual TradingView webhook / signal source to make it live.
- **Live broker page**: Fully built UI, intentionally shows "not connected" — no broker is
  wired in. Tell me which broker you want and I'll build the actual integration next.
- **Funded account page**: Same as above, plus a rules-engine layer (daily loss limit, max
  drawdown, etc.) that still needs to be built once you pick a prop firm.

## Structure

```
app/
  paper/page.tsx    - paper trading dashboard
  live/page.tsx     - live broker placeholder
  funded/page.tsx   - funded account placeholder
  layout.tsx        - root layout
  globals.css       - design tokens (colors, fonts)
components/
  Shell.tsx         - sidebar nav + gold price ticker
  PageHeader.tsx     - shared page header w/ status pill
  StatCard.tsx       - shared metric card
```
