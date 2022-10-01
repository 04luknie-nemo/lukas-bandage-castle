import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MonsterListPage from './pages/MonsterListPage'
import MonsterDetailPage from './pages/MonsterDetailPage'
import MonsterFormPage from './pages/MonsterFormPage'
import CustomerListPage from './pages/CustomerListPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import StayListPage from './pages/StayListPage'
import StayDetailPage from './pages/StayDetailPage'
import NewStayPage from './pages/NewStayPage'
import InvoiceListPage from './pages/InvoiceListPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import ReportsPage from './pages/ReportsPage'
import MyMonstersPage from './pages/MyMonstersPage'
import MyInvoicesPage from './pages/MyInvoicesPage'

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch (e) {
    return null
  }
}

function Home() {
  const user = currentUser()
  return <div className="page">welcome to the castle{user ? ', ' + (user.name || user.email) : ''}</div>
}

export default function App() {
  const user = currentUser()
  const isOwner = user && user.role === 'OWNER'
  return (
    <div>
      <nav className="nav">
        <Link to="/">Home</Link>
        {isOwner ? (
          <>
            <Link to="/my/monsters">My monsters</Link>
            <Link to="/my/invoices">My invoices</Link>
          </>
        ) : (
          <>
            <Link to="/monsters">Monsters</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/stays">Stays</Link>
            <Link to="/invoices">Invoices</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
        <Route path="/monsters/new" element={<MonsterFormPage />} />
        <Route path="/monsters/:id" element={<MonsterDetailPage />} />
        <Route path="/monsters/:id/edit" element={<MonsterFormPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/stays" element={<StayListPage />} />
        <Route path="/stays/new" element={<NewStayPage />} />
        <Route path="/stays/:id" element={<StayDetailPage />} />
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/my/monsters" element={<MyMonstersPage />} />
        <Route path="/my/invoices" element={<MyInvoicesPage />} />
      </Routes>
    </div>
  )
}
