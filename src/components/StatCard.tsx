export default function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "positive" | "negative";
  icon?: React.ReactNode;
}) {
  const toneColor =
    tone === "positive" ? "text-accent" : tone === "negative" ? "text-danger" : "text-white";

  const toneClass =
    tone === "positive"
      ? "card-tone-positive"
      : tone === "negative"
        ? "card-tone-negative"
        : "";

  const accentClass = tone !== "default" ? "card-accent-top" : "";

  return (
    <div className={`card card-hover p-5 ${toneClass} ${accentClass}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-muted/70">{icon}</span>}
        <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      </div>
      <div className={`font-mono-num text-2xl ${toneColor}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1.5">{sub}</div>}
    </div>
  );
}
