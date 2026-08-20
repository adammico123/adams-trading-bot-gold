import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";

export default function LiveBrokerPage() {
  return (
    <Shell>
      <PageHeader
        eyebrow="Mode 02"
        title="Live broker"
        description="Executes real orders through a connected broker account. No broker is connected yet — signals will not place trades until one is set up."
        statusLabel="Not connected"
        statusTone="warn"
      />

      <div className="px-8 py-8 space-y-6">
        <div className="border border-line-soft rounded-lg bg-surface px-6 py-10 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full border border-line flex items-center justify-center mb-4">
            <span className="w-2 h-2 rounded-full bg-down" />
          </div>
          <h3 className="text-base">No broker connected</h3>
          <p className="text-sm text-text-faint mt-2 max-w-md">
            This mode is built and ready to receive signals, but nothing will execute until a
            broker account is linked. Real orders will only ever be placed here after you connect
            one on purpose.
          </p>
          <button
            disabled
            className="mt-6 px-4 py-2 rounded-md border border-line text-sm text-text-faint cursor-not-allowed"
          >
            Connect a broker — coming soon
          </button>
        </div>

        <div className="border border-line-soft rounded-lg bg-surface px-5 py-4">
          <h3 className="text-sm text-text-dim mb-3">What this page will do</h3>
          <ul className="text-sm text-text-faint space-y-2 leading-relaxed list-disc list-inside">
            <li>Authenticate with a broker of your choice via their API</li>
            <li>Forward validated signals from the strategy as real market orders</li>
            <li>Show live position, fill, and account balance data in place of these placeholders</li>
            <li>Require an explicit confirmation step before going live with real capital</li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
