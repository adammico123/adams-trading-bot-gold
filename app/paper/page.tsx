import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Signal = {
  receivedAt: string;
  ticker: string;
  action: string;
  quantity?: number;
  price?: number;
  note?: string;
};

async function getSignals(): Promise<Signal[]> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/signals/paper`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.signals || [];
  } catch {
    return [];
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour12: false });
}

export default async function PaperTradingPage() {
  const signals = await getSignals();
  const hasSignals = signals.length > 0;

  return (
    <Shell>
      <PageHeader
        eyebrow="Mode 01"
        title="Paper trading"
        description="Runs the strategy against a simulated fill engine. No real capital moves. Use this to watch how signals behave before connecting a broker."
        statusLabel={hasSignals ? "Receiving signals" : "Waiting for first signal"}
        statusTone={hasSignals ? "active" : "idle"}
      />

      <div className="px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Signals received"
            value={String(signals.length)}
            sub={hasSignals ? "Since this deployment" : "None yet"}
          />
          <StatCard
            label="Last signal"
            value={hasSignals ? signals[0].action.toUpperCase() : "—"}
            sub={hasSignals ? formatTime(signals[0].receivedAt) : "No signals yet"}
          />
        </div>

        <div className="border border-line-soft rounded-lg bg-surface">
          <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
            <h3 className="text-sm text-text-dim">Recent signals</h3>
            <span className="text-xs font-mono text-text-faint">
              Webhook: /api/signals/paper
            </span>
          </div>
          {hasSignals ? (
            <div className="divide-y divide-line-soft">
              {signals.slice(0, 20).map((s, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center gap-4 text-sm font-mono"
                >
                  <span className="text-text-faint w-24">
                    {formatTime(s.receivedAt)}
                  </span>
                  <span
                    className={
                      "w-14 uppercase " +
                      (s.action === "buy" ? "text-up" : "text-text-dim")
                    }
                  >
                    {s.action}
                  </span>
                  <span className="text-text-dim w-20">{s.ticker}</span>
                  <span className="text-text-dim w-16">
                    {s.quantity ? `${s.quantity} ct` : "—"}
                  </span>
                  <span className="text-text w-24">
                    {s.price ? s.price.toFixed(2) : "—"}
                  </span>
                  <span className="text-text-faint text-xs">{s.note || ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-text-dim">No signals received yet</p>
              <p className="text-xs text-text-faint mt-1 max-w-md mx-auto">
                Once your TradingView alert fires and hits this endpoint, real
                signals will appear here automatically.
              </p>
            </div>
          )}
        </div>

        <div className="border border-line-soft rounded-lg bg-surface px-5 py-4">
          <h3 className="text-sm text-text-dim mb-3">Connection</h3>
          <p className="text-sm text-text-faint leading-relaxed">
            This mode listens on a webhook endpoint for alerts sent from your TradingView
            strategy. Point your Pine script&apos;s alert at this instance&apos;s paper-trading
            webhook URL to start streaming real signals here.
          </p>
        </div>
      </div>
    </Shell>
  );
}