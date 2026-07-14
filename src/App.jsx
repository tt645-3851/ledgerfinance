import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Budget from './pages/Budget.jsx'
import Loans from './pages/Loans.jsx'
import Debt from './pages/Debt.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="budget" element={<Budget />} />
        <Route path="loans" element={<Loans />} />
        <Route path="debt" element={<Debt />} />
      </Route>
    </Routes>
  )
}
