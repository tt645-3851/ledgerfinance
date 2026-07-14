export default function StatCard({ label, value, tone = 'default', hint }) {
  const toneClass =
    tone === 'positive'
      ? 'text-ledger-dark'
      : tone === 'negative'
      ? 'text-debt'
      : 'text-ink'

  return (
    <div className="border border-line rounded p-4 bg-white/40">
      <p className="text-xs uppercase tracking-widest text-inkSoft font-mono mb-2">
        {label}
      </p>
      <p className={`figure text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="text-xs text-inkSoft mt-1">{hint}</p>}
    </div>
  )
}
