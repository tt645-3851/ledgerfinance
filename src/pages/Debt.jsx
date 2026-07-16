import { useState, useEffect } from 'react'
import { listDebts, addDebt, deleteDebt } from '../lib/storage'
import { formatCurrency, simulatePayoff, buildPayoffComparisonChartData } from '../lib/finance'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Debt() {
  const [name, setName] = useState('')
  const [debts, setDebts] = useState([])
  const [balance, setBalance] = useState('')
  const [apr, setApr] = useState('')
  const [minPayment, setMinPayment] = useState('')
  const [extraPerMonth, setExtraPerMonth] = useState('')
  const [comparison, setComparison] = useState(null)
  const chartData = comparison ? buildPayoffComparisonChartData(comparison) : []

  async function handleAddDebt(e) {
    e.preventDefault()

    const b = parseFloat(balance)
    const a = parseFloat(apr)
    const mp = parseFloat(minPayment)

    if (!name.trim() || Number.isNaN(b) || Number.isNaN(a) || Number.isNaN(mp)) return

    const record = await addDebt({ name: name.trim(), balance: b, apr: a, minPayment: mp })
    setDebts((prev) => [...prev, record])

    setName('')
    setBalance('')
    setApr('')
    setMinPayment('')
  }

  async function handleDeleteDebt(id) {
    await deleteDebt(id)
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  function handleCompare(e) {
    e.preventDefault()

    const extra = parseFloat(extraPerMonth) || 0

    const avalanche = simulatePayoff(debts, extra, 'avalanche')
    const snowball = simulatePayoff(debts, extra, 'snowball')

    console.log('avalance:', avalanche.months, avalanche.totalInterest)
    console.log('snowball', snowball.months, avalanche.totalInterest)

    setComparison({ avalanche, snowball })
  }

  useEffect(() => {
    listDebts().then(setDebts)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-3xl">Debt Payoff</h2>

      <form onSubmit={handleAddDebt} className='border border-line rounded p-5 bg-white/40 space-y-4'>
        <div>
          <p className='text-m uppercase tracking-widest text-inkSoft font-mono mb-2'>
            Loan Details
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 items-end'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Loan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Chase credit card'
                className='border border-line rounded px-2 py-1.5 bg-white'
              ></input>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Balance</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder='500'
                className='border border-line rounded px-2 py-1.5 bg-white'
              ></input>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Interest Rate (APR)</label>
              <input
                type="number"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                placeholder='Interest rate'
                className='border border-line rounded px-2 py-1.5 bg-white'
              ></input>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Minimum Payment</label>
              <input
                type="number"
                value={minPayment}
                onChange={(e) => setMinPayment(e.target.value)}
                placeholder='current min payment'
                className='border border-line rounded px-2 py-1.5 bg-white'
              ></input>
            </div>
          </div>
        </div>

        <button
          type='submit'
          className='justify-self-start bg-ledger text-paper px-4 py-2 rounded text-sm hover:bg-ledger-dark transition-colors'
        >Add Debt/Loan</button>
      </form>

      <form onSubmit={handleCompare} className='border border-line rounded p-5 bg-white/40 flex items-end gap-3'>
        <div className='flex flex-col gap-1'>
          <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Extra per month</label>
          <input
            type="number"
            value={extraPerMonth}
            onChange={(e) => setExtraPerMonth(e.target.value)}
            placeholder='0'
            className='border border-line rounded px-2 py-1.5 bg-white'
          />
        </div>
        <button type='submit' className='bg-ledger text-paper px-4 py-2 rounded text-sm hover:bg-ledger-dark transition-colors'>
          Compare Strategies
        </button>
      </form>

      {debts.length === 0 ? (
        <p className='text-inkSoft text-sm'>No debts added yet.</p>
      ) : (
        <div className='border border-line rounded divide-y divide-line'>
          {debts.map((d) => (
            <div key={d.id} className='flex items-center justify-between px-4 py-2.5 text-sm'>
              <span>{d.name}</span>
              <span className='figure'>{formatCurrency(d.balance)}</span>
              <button
                onClick={() => handleDeleteDebt(d.id)}
                className='text-inkSoft hover:text-debt text-xs'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {comparison && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='border border-line rounded p-4'>
            <p className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Avalanche</p>
            <p className='figure text-xl'>{comparison.avalanche.months} months</p>
            <p className='figure text-sm text-inkSoft'>{formatCurrency(comparison.avalanche.totalInterest)}</p>
          </div>
          <div className='border border-line rounded p-4'>
            <p className='text-xs uppercase tracking-widest text-inkSoft font-mono mb-2'>Snowball</p>
            <p className='figure text-xl'>{comparison.snowball.months} months</p>
            <p className='figure text-sm text-inkSoft'>{formatCurrency(comparison.snowball.totalInterest)}</p>
          </div>

          <div className='border border-line rounded p-5 bg-white/40'>
            <h3 className='text-sm uppercase tracking-widest text-inkSoft font-mono mb-4'>
              Balance over time
            </h3>
            <ResponsiveContainer width='100%' height={280}>
              <LineChart data={chartData}>
                <XAxis dataKey='month' tick={{ fontSize: 12 }}/>
                <YAxis tick={{ fontSize: 12 }}/>
                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(m) => `Month ${m}`}/>
                <Legend/>
                <Line type='monotone' dataKey='avalancheBalance' stroke='#2F5D50' name='Avalanche' dot={false}/>
                <Line type='monotone' dataKey='snowballBalance' stroke='#B35C5C' name='Snowball' dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  )
}
