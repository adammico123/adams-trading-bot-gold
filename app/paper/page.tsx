import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getStoredSignals, getAccount, STARTING_EQUITY } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", { hour12: false });
  return `${datePart} ${timePart}`;
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function PaperTradingPage() {
  const signals = await getStoredSignals();
  const account = await getAccount();
  const hasSignals = signals.length > 0;

  const pnlSinceStart = account.equity - STARTING_EQUITY;
  const pnlPercent = (pnlSinceStart / STARTING_EQUITY) * 100;
  const wins = account.closedTrades.filter((t) => t.pnl > 0).length;
  const totalClosed = account.closedTrades.length;
  const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : null;

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
            label="Account equity"
            value={formatCurrency(account.equity)}
            tone={pnlSinceStart > 0 ? "up" : pnlSinceStart < 0 ? "down" : "neutral"}
            sub={
              pnlSinceStart === 0
                ? "No closed trades yet"
                : `${pnlSinceStart > 0 ? "+" : ""}${pnlPercent.toFixed(1)}% since start`
            }
          />
          <StatCard
            label="Open position"
            value={account.position ? `${account.position.quantity} ct` : "Flat"}
            sub={
              account.position
                ? `Entry ${account.position.entryPrice.toFixed(2)}`
                : "No position held"
            }
          />
          <StatCard
            label="Closed trades"
            value={String(totalClosed)}
            sub={winRate !== null ? `${winRate.toFixed(0)}% win rate` : "None yet"}
          />
          <StatCard
            label="Signals received"
            value={String(signals.length)}
            sub={hasSignals ? "Since this deployment" : "None yet"}
          />
        </div>

        {account.closedTrades.length > 0 && (
          <div className="border border-line-soft rounded-lg bg-surface">
            <div className="px-5 py-4 border-b border-line-soft">
              <h3 className="text-sm text-text-dim">Closed trades</h3>
            </div>
            <div className="divide-y divide-line-soft">
              {account.closedTrades.slice(0, 10).map((t, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center gap-4 text-sm font-mono"
                >
                  <span className="text-text-faint w-36">
                    {formatDateTime(t.closedAt)}
                  </span>
                  <span className="text-text-dim w-16">{t.quantity} ct</span>
                  <span className="text-text-dim w-24">
                    {t.entryPrice.toFixed(2)} → {t.exitPrice.toFixed(2)}
                  </span>
                  <span
                    className={
                      "font-medium " + (t.pnl >= 0 ? "text-up" : "text-down")
                    }
                  >
                    {t.pnl >= 0 ? "+" : ""}
                    {formatCurrency(t.pnl)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <span className="text-text-faint w-36">
                    {formatDateTime(s.receivedAt)}
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