export default function PageHeader({
  eyebrow,
  title,
  description,
  statusLabel,
  statusTone = "idle",
}: {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone?: "idle" | "active" | "warn";
}) {
  const toneClasses = {
    idle: "bg-surface-raised text-text-dim border-line",
    active: "bg-gold-soft text-gold border-gold-dim",
    warn: "bg-surface-raised text-down border-line",
  }[statusTone];

  return (
    <div className="px-8 py-8 border-b border-line-soft flex items-start justify-between gap-6">
      <div>
        <p className="text-xs tracking-widest text-text-faint uppercase font-mono">
          {eyebrow}
        </p>
        <h2 className="text-2xl mt-1">{title}</h2>
        <p className="text-text-dim text-sm mt-2 max-w-xl">{description}</p>
      </div>
      <span
        className={
          "shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border " +
          toneClasses
        }
      >
        {statusLabel}
      </span>
    </div>
  );
}
