import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const RECENT_SIGNALS = [
  { time: "14:32:08", action: "BUY", qty: 3, price: "4,581.20", note: "%B crossover" },
  { time: "11:05:41", action: "EXIT", qty: 3, price: "4,586.40", note: "Take profit" },
  { time: "08:47:12", action: "BUY", qty: 2, price: "4,558.90", note: "%B crossover" },
];

export default function PaperTradingPage() {
  return (
    <Shell>
      <PageHeader
        eyebrow="Mode 01"
        title="Paper trading"
        description="Runs the strategy against a simulated fill engine. No real capital moves. Use this to watch how signals behave before connecting a broker."
        statusLabel="Simulation running"
        statusTone="active"
      />

      <div className="px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Simulated equity" value="$28,140" tone="up" sub="+12.6% since start" />
          <StatCard label="Open position" value="Flat" sub="No position held" />
          <StatCard label="Win rate" value="54.0%" sub="147 / 272 trades" />
          <StatCard label="Profit factor" value="1.39" sub="Gross win ÷ gross loss" />
        </div>

        <div className="border border-line-soft rounded-lg bg-surface">
          <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between">
            <h3 className="text-sm text-text-dim">Recent signals</h3>
            <span className="text-xs font-mono text-text-faint">Webhook: /api/signals/paper</span>
          </div>
          <div className="divide-y divide-line-soft">
            {RECENT_SIGNALS.map((s, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4 text-sm font-mono">
                <span className="text-text-faint w-20">{s.time}</span>
                <span
                  className={
                    "w-14 " +
                    (s.action === "BUY" ? "text-up" : "text-text-dim")
                  }
                >
                  {s.action}
                </span>
                <span className="text-text-dim w-16">{s.qty} ct</span>
                <span className="text-text w-24">{s.price}</span>
                <span className="text-text-faint text-xs">{s.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line-soft rounded-lg bg-surface px-5 py-4">
          <h3 className="text-sm text-text-dim mb-3">Connection</h3>
          <p className="text-sm text-text-faint leading-relaxed">
            This mode listens on a webhook endpoint for alerts sent from your TradingView
            strategy. Point your Pine script&apos;s alert at this instance&apos;s paper-trading
            webhook URL to start streaming simulated fills here.
          </p>
        </div>
      </div>
    </Shell>
  );
}
