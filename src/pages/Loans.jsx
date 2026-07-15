import { useState } from 'react'
import { amortizationSchedule, formatCurrency} from '../lib/finance'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Loans() {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('')
  const [termMonths, setTermMonths] = useState('')
  const [result, setResult] = useState(null)
  const [extraAmount, setExtraAmount] = useState('')
  const [extraMonth, setExtraMonth] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const t = parseInt(termMonths, 10)
    const ea = parseFloat(extraAmount) || 0
    const em = parseInt(extraMonth, 10) || null

    const calculated = amortizationSchedule(p, r, t, { extraAmount: ea, extraMonth: em })
    setResult(calculated)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl">Loans &amp; TVM</h2>
      
      <form
        onSubmit={handleSubmit}
        className="border border-line rounded p-5 bg-white/40 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      >
      <div className='flex flex-col gap-1 sm:col-span-2'>
       <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Loan Amount</label>
       <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder='Loan amount'
          className='border border-line rounded px-2 py-1.5 bg-white'
        ></input>        
      </div>

      <div className='flex flex-col gap-1 sm:col-span-2'>
       <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Extra Payment Amount</label>
       <input
          type="number"
          value={extraAmount}
          onChange={(e) => setExtraAmount(e.target.value)}
          placeholder='Extra payment amount'
          className='border border-line rounded px-2 py-1.5 bg-white'
        ></input>        
      </div>

      <div className='flex flex-col gap-1 sm:col-span-2'>
       <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Apply in month #</label>
       <input
          type="number"
          value={extraMonth}
          onChange={(e) => setExtraMonth(e.target.value)}
          placeholder='Apply month for extra payment'
          className='border border-line rounded px-2 py-1.5 bg-white'
        ></input>        
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Rate</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder='interest rate'
          className='border border-line rounded px-2 py-1.5 bg-white'
        ></input>        
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-xs uppercase tracking-widest text-inkSoft font-mono'>Months</label>
        <input
          type="number"
          value={termMonths}
          onChange={(e) => setTermMonths(e.target.value)}
          placeholder='term months'
          className='border border-line rounded px-2 py-1.5 bg-white'
        ></input>        
      </div>

        <button 
          type='submit'
          className='sm:col-span-5 justify-self-start bg-ledger text-paper px-4 py-2 rounded text-sm hover:bg-ledger-dark transition-colors'
        >Calculate</button>
      </form>

      {result && (
        <div className="border border-line rounded overflow-hidden">
          <div className='max-h-96 overflow-y-auto'>
            <table className='w-full text-sm'>
              <thead className='sticky top-0 bg-paperDim'>
                <tr className='text-left text-xs uppercase tracking-widest text-inkSoft font-mono'>
                  <th className='px-4 py-2'>Month</th>
                  <th className='px-4 py-2'>Payment</th>
                  <th className='px-4 py-2'>Principal</th>
                  <th className='px-4 py-2'>Interest</th>
                  <th className='px-4 py-2'>Balance</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-line'>
                {result.rows.map((row) => (
                  <tr key={row.month}>
                    <td className='px-4 py-2 figure'>{row.month}</td>
                    <td className='px-4 py-2 figure'>{formatCurrency(row.payment)}</td>
                    <td className='px-4 py-2 figure'>{formatCurrency(row.principalPaid)}</td> 
                    <td className='px-4 py-2 figure'>{formatCurrency(row.interest)}</td>
                    <td className='px-4 py-2 figure'>{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='border border-line rounded p-5 bg-white/40'>
            <h3 className='text-sm uppercase tracking-widest text-inkSoft font-mono mb-4'>
              Principal vs. interest over time
            </h3>
            <ResponsiveContainer width='100%' height={280}>
              <AreaChart data={result.rows}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }}/>
                <YAxis tick={{ fontSize: 12 }}/>
                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(m) => `Month ${m}`}/>
                <Area type='monotone' dataKey='principalPaid' stackId='1' stroke='#2F5D50' fill='#2F5D50' name='Principal'/>
                <Area type='monotone' dataKey='interest' stackId='1' stroke='#B3452C' fill='#B3452C' name='Interest'/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
