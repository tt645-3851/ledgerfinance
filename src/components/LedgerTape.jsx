import { formatCurrency } from '../lib/finance'

/**
 * The signature visual for the dashboard: a strip of recent transactions
 * styled like adding-machine tape, each line showing its running balance —
 * so the page's "hero" is literally the ledger itself, not a stat card.
 */
export default function LedgerTape({ transactions }) {
  if (!transactions.length) {
    return (
      <div className="border border-dashed border-line rounded p-8 text-center text-inkSoft text-sm">
        No entries yet. Add income or an expense on the Budget page and this
        tape will fill in.
      </div>
    )
  }

  // Running balance from oldest to newest, then display newest first
  let running = 0
  const withRunning = [...transactions]
    .slice()
    .reverse()
    .map((t) => {
      running += t.type === 'income' ? t.amount : -t.amount
      return { ...t, running }
    })
    .reverse()

  return (
    <div className="bg-white border border-line rounded shadow-sm overflow-hidden">
      <div
        className="font-mono text-sm"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent, transparent 43px, #D8D3C7 43px, #D8D3C7 44px)',
        }}
      >
        {withRunning.slice(0, 12).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-inkSoft text-xs shrink-0">
                {new Date(t.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="truncate">{t.label}</span>
              <span className="text-xs text-inkSoft shrink-0">
                {t.category}
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span
                className={
                  t.type === 'income' ? 'text-ledger-dark' : 'text-debt'
                }
              >
                {t.type === 'income' ? '+' : '−'}
                {formatCurrency(t.amount)}
              </span>
              <span className="text-inkSoft w-24 text-right">
                {formatCurrency(t.running)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
