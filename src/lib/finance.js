/**
 * Core financial math. Pure functions, no side effects — straight from
 * time-value-of-money and amortization formulas.
 */

export function formatCurrency(n) {
  if (Number.isNaN(n) || n === null || n === undefined) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/**
 * Standard loan amortization: fixed-rate, fixed-payment loan
 * (car loan, mortgage, student loan).
 *
 * principal: loan amount
 * annualRatePct: annual interest rate as a percent, e.g. 6.5
 * termMonths: number of monthly payments
 */
export function amortizationSchedule(principal, annualRatePct, termMonths, options = {}) {
  const { extraAmount = 0, extraMonth = null } = options
  const monthlyRate = annualRatePct / 100 / 12
  const payment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))

  let balance = principal
  const rows = []
  let totalInterest = 0

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate
    let principalPaid = payment - interest

    if (month === extraMonth) {
      principalPaid += extraAmount
    }

    if (month === termMonths || principalPaid > balance) {
      principalPaid = balance
    }
    balance = Math.max(0, balance - principalPaid)
    totalInterest += interest

    rows.push({
      month,
      payment: interest + principalPaid,
      principalPaid,
      interest,
      balance,
    })

    if (balance <= 0) break
  }

  return {
    monthlyPayment: payment,
    totalInterest,
    totalPaid: principal + totalInterest,
    rows,
  }
}

/**
 * Time value of money — solve for future value given present value,
 * a periodic contribution, a rate, and a number of periods.
 * Matches the standard annuity formula taught alongside PV/FV/PMT problems.
 */
export function futureValue({ presentValue = 0, contribution = 0, annualRatePct, years, compoundsPerYear = 12 }) {
  const n = years * compoundsPerYear
  const r = annualRatePct / 100 / compoundsPerYear

  const fvOfPrincipal = presentValue * Math.pow(1 + r, n)
  const fvOfContributions =
    r === 0 ? contribution * n : contribution * ((Math.pow(1 + r, n) - 1) / r)

  return {
    futureValue: fvOfPrincipal + fvOfContributions,
    totalContributed: presentValue + contribution * n,
    n,
    r,
  }
}

/**
 * Present value — how much a future sum is worth today.
 */
export function presentValue(futureAmount, annualRatePct, years, compoundsPerYear = 12) {
  const n = years * compoundsPerYear
  const r = annualRatePct / 100 / compoundsPerYear
  return futureAmount / Math.pow(1 + r, n)
}

/**
 * Debt payoff simulator — snowball (smallest balance first) or
 * avalanche (highest rate first), with a fixed total monthly budget
 * across all debts.
 *
 * debts: [{ id, name, balance, apr, minPayment }]
 * extraPerMonth: additional amount beyond minimums, applied to the target debt
 */
export function simulatePayoff(debts, extraPerMonth, strategy = 'avalanche') {
  let working = debts.map((d) => ({ ...d, balance: d.balance }))
  const order = [...working].sort((a, b) =>
    strategy === 'avalanche' ? b.apr - a.apr : a.balance - b.balance,
  )
  const orderIds = order.map((d) => d.id)

  console.log(strategy, order.map((d) => `${d.name}: apr=${d.apr}, bal=${d.balance}`))

  let month = 0
  let totalInterest = 0
  const history = []
  const maxMonths = 600 // safety cap (50 years)

  while (working.some((d) => d.balance > 0.01) && month < maxMonths) {
    month++
    let extra = extraPerMonth

    // Apply interest and minimum payments
    for (const d of working) {
      if (d.balance <= 0) continue
      const monthlyRate = d.apr / 100 / 12
      const interest = d.balance * monthlyRate
      totalInterest += interest
      d.balance += interest
      const pay = Math.min(d.minPayment, d.balance)
      d.balance -= pay
    }

    // Apply extra to the target debt in strategy order, rolling over
    // to the next debt once one is paid off
    for (const id of orderIds) {
      if (extra <= 0) break
      const d = working.find((x) => x.id === id)
      if (!d || d.balance <= 0) continue
      const pay = Math.min(extra, d.balance)
      d.balance -= pay
      extra -= pay
    }

    history.push({
      month,
      totalBalance: working.reduce((s, d) => s + Math.max(0, d.balance), 0),
    })
  }

  return {
    months: month,
    totalInterest,
    payoffDate: month,
    history,
    reachedCap: month >= maxMonths,
  }
}

export function buildPayoffComparisonChartData(comparsion) {
  const { avalanche, snowball } = comparsion

  const longerIsAvalanche = avalanche.months >= snowball.months
  const longer = longerIsAvalanche ? avalanche.history : snowball.history
  const shorter = longerIsAvalanche ? snowball.history : avalanche.history
  
  return longer.map((entry) => {
    const match = shorter.find((s) => s.month === entry.month)
    const shorterBalance = match ? match.totalBalance : 0

    return {
      month: entry.month,
      avalancheBalance: longerIsAvalanche ? entry.totalBalance : shorterBalance,
      snowballBalance: longerIsAvalanche ? shorterBalance : entry.totalBalance,
    }
  })
}
