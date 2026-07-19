export default function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneColor =
    tone === "positive" ? "text-accent" : tone === "negative" ? "text-danger" : "text-white";

  return (
    <div className="card p-5">
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div className={`font-mono-num text-2xl mt-2 ${toneColor}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
