export default function StatCard({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "up" | "down";
  sub?: string;
}) {
  const toneClass = {
    neutral: "text-text",
    up: "text-up",
    down: "text-down",
  }[tone];

  return (
    <div className="border border-line-soft rounded-lg px-5 py-4 bg-surface">
      <p className="text-xs text-text-faint uppercase tracking-wider">
        {label}
      </p>
      <p className={"font-mono text-2xl mt-1.5 tabular-nums " + toneClass}>
        {value}
      </p>
      {sub && <p className="text-xs text-text-faint mt-1">{sub}</p>}
    </div>
  );
}
