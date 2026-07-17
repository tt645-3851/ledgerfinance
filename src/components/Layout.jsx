import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/budget', label: 'Budget' },
  { to: '/loans', label: 'Loans & TVM' },
  { to: '/debt', label: 'Debt Payoff' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ledger</h1>
            <p className="text-xs text-inkSoft font-mono uppercase tracking-widest mt-0.5">
              Personal Finance Statement
            </p>
          </div>
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm rounded transition-colors ${
                    isActive
                      ? 'bg-ledger text-paper'
                      : 'text-inkSoft hover:bg-paperDim'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line py-4">
        <p className="max-w-5xl mx-auto px-6 text-xs text-inkSoft">
          
        </p>
      </footer>
    </div>
  )
}
