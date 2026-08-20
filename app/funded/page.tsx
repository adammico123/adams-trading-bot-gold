import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";

export default function FundedAccountPage() {
  return (
    <Shell>
      <PageHeader
        eyebrow="Mode 03"
        title="Funded account"
        description="For prop-firm evaluation or funded accounts, where rules like daily loss limits and max drawdown are enforced by the firm. No funded account is connected yet."
        statusLabel="Not connected"
        statusTone="warn"
      />

      <div className="px-8 py-8 space-y-6">
        <div className="border border-line-soft rounded-lg bg-surface px-6 py-10 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full border border-line flex items-center justify-center mb-4">
            <span className="w-2 h-2 rounded-full bg-down" />
          </div>
          <h3 className="text-base">No funded account connected</h3>
          <p className="text-sm text-text-faint mt-2 max-w-md">
            This mode will layer prop-firm rule limits — daily loss cap, max drawdown,
            consistency rules — on top of live execution, so the strategy can&apos;t
            accidentally breach the firm&apos;s terms. Not wired to a firm yet.
          </p>
          <button
            disabled
            className="mt-6 px-4 py-2 rounded-md border border-line text-sm text-text-faint cursor-not-allowed"
          >
            Connect a funded account — coming soon
          </button>
        </div>

        <div className="border border-line-soft rounded-lg bg-surface px-5 py-4">
          <h3 className="text-sm text-text-dim mb-3">Planned rule guardrails</h3>
          <ul className="text-sm text-text-faint space-y-2 leading-relaxed list-disc list-inside">
            <li>Daily loss limit — halts new entries once hit, independent of the strategy&apos;s own logic</li>
            <li>Max drawdown tracking against the firm&apos;s specific threshold</li>
            <li>Trading window restrictions if the firm requires them</li>
            <li>An automatic flatten-and-stop if any rule is at risk of being breached</li>
          </ul>
          <p className="text-xs text-text-faint mt-4">
            These guardrails matter more here than anywhere else in this app — a rule breach on a
            funded account can end the account outright, so this mode will be built with the
            firm&apos;s limits enforced independently of the trading strategy itself.
          </p>
        </div>
      </div>
    </Shell>
  );
}
