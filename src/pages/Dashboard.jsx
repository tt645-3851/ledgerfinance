import { useEffect, useState } from 'react'
import { listTransactions, listDebts } from '../lib/storage'
import { formatCurrency } from '../lib/finance'
import StatCard from '../components/StatCard.jsx'
import LedgerTape from '../components/LedgerTape.jsx'

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listTransactions(), listDebts()]).then(([tx, d]) => {
      setTransactions(tx)
      setDebts(d)
      setLoading(false)
    })
  }, [])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthTx = transactions.filter((t) => t.createdAt.slice(0, 7) === thisMonth)
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expenses
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)

  if (loading) return <p className="text-inkSoft">Loading…</p>

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl mb-1">Overview</h2>
        <p className="text-inkSoft text-sm">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Net cash flow (this month)"
          value={formatCurrency(net)}
          tone={net >= 0 ? 'positive' : 'negative'}
          hint={`${formatCurrency(income)} in · ${formatCurrency(expenses)} out`}
        />
        <StatCard
          label="Total debt balance"
          value={formatCurrency(totalDebt)}
          tone={totalDebt > 0 ? 'negative' : 'positive'}
          hint={`${debts.length} open account${debts.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Entries logged"
          value={transactions.length}
          hint="Across all time"
        />
      </div>

      <div>
        <h3 className="text-lg mb-3 font-display">Recent activity</h3>
        <LedgerTape transactions={transactions} />
      </div>
    </div>
  )
}
