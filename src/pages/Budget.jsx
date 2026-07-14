import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { listTransactions, addTransaction, deleteTransaction } from '../lib/storage'
import { formatCurrency } from '../lib/finance'

const CATEGORIES = {
  income: ['Paycheck', 'Side income', 'Gift', 'Other income'],
  expense: ['Housing', 'Food', 'Transportation', 'Insurance', 'Debt payment', 'Subscriptions', 'Other'],
}

const COLORS = ['#2F5D50', '#C9A227', '#B3452C', '#4A5568', '#3E7A6A', '#C8654A', '#1F4038']

export default function Budget() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('expense')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])

  useEffect(() => {
    listTransactions().then(setTransactions)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!label.trim() || Number.isNaN(amt) || amt <= 0) return
    const record = await addTransaction({ type, label: label.trim(), amount: amt, category })
    setTransactions((prev) => [record, ...prev])
    setLabel('')
    setAmount('')
  }

  async function handleDelete(id) {
    await deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const expenseByCategory = useMemo(() => {
    const totals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount
      })
    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  }, [transactions])

  return (
    <div className="space-y-8">
      <h2 className="text-3xl">Budget &amp; Cash Flow</h2>

      <form
        onSubmit={handleSubmit}
        className="border border-line rounded p-5 bg-white/40 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest text-inkSoft font-mono">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setCategory(CATEGORIES[e.target.value][0])
            }}
            className="border border-line rounded px-2 py-1.5 bg-white"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-inkSoft font-mono">Description</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Rent, Groceries, Paycheck"
            className="border border-line rounded px-2 py-1.5 bg-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest text-inkSoft font-mono">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-line rounded px-2 py-1.5 bg-white"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest text-inkSoft font-mono">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="border border-line rounded px-2 py-1.5 bg-white figure"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-5 justify-self-start bg-ledger text-paper px-4 py-2 rounded text-sm hover:bg-ledger-dark transition-colors"
        >
          Add entry
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-display mb-3">All entries</h3>
          <div className="border border-line rounded divide-y divide-line max-h-96 overflow-y-auto">
            {transactions.length === 0 && (
              <p className="p-4 text-sm text-inkSoft">No entries yet.</p>
            )}
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div>
                  <p>{t.label}</p>
                  <p className="text-xs text-inkSoft">{t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`figure ${t.type === 'income' ? 'text-ledger-dark' : 'text-debt'}`}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-inkSoft hover:text-debt text-xs"
                    aria-label={`Delete ${t.label}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-display mb-3">Spending by category</h3>
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-inkSoft">Add an expense to see the breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
