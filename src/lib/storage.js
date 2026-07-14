/**
 * Data layer for the app.
 *
 * Every page talks to this module only — never to localStorage directly.
 * Right now each function reads/writes the browser's localStorage. When
 * you're ready for a real backend, you can rewrite the *insides* of these
 * functions to call `fetch('/api/...')` instead, and nothing in the pages
 * or components needs to change, because the function signatures
 * (what goes in, what comes back) stay the same.
 *
 * Every function returns a Promise, even though localStorage is synchronous.
 * That's deliberate — it means the UI code already awaits these calls,
 * so swapping in real network requests later is a one-file change.
 */

const KEYS = {
  transactions: 'fin_dashboard.transactions',
  debts: 'fin_dashboard.debts',
  loans: 'fin_dashboard.loans',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ---------- Transactions (budget / cash flow) ----------

export async function listTransactions() {
  return read(KEYS.transactions, [])
}

export async function addTransaction(tx) {
  const all = read(KEYS.transactions, [])
  const record = { id: uid(), createdAt: new Date().toISOString(), ...tx }
  write(KEYS.transactions, [record, ...all])
  return record
}

export async function deleteTransaction(id) {
  const all = read(KEYS.transactions, [])
  write(KEYS.transactions, all.filter((t) => t.id !== id))
}

// ---------- Debts (credit cards, loans you're paying off) ----------

export async function listDebts() {
  return read(KEYS.debts, [])
}

export async function addDebt(debt) {
  const all = read(KEYS.debts, [])
  const record = { id: uid(), ...debt }
  write(KEYS.debts, [...all, record])
  return record
}

export async function updateDebt(id, patch) {
  const all = read(KEYS.debts, [])
  const next = all.map((d) => (d.id === id ? { ...d, ...patch } : d))
  write(KEYS.debts, next)
  return next.find((d) => d.id === id)
}

export async function deleteDebt(id) {
  const all = read(KEYS.debts, [])
  write(KEYS.debts, all.filter((d) => d.id !== id))
}

// ---------- Saved loan/TVM calculations ----------

export async function listLoans() {
  return read(KEYS.loans, [])
}

export async function saveLoan(loan) {
  const all = read(KEYS.loans, [])
  const record = { id: uid(), createdAt: new Date().toISOString(), ...loan }
  write(KEYS.loans, [record, ...all])
  return record
}

export async function deleteLoan(id) {
  const all = read(KEYS.loans, [])
  write(KEYS.loans, all.filter((l) => l.id !== id))
}
