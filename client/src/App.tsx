import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MonsterListPage from './pages/MonsterListPage'
import CustomerListPage from './pages/CustomerListPage'
import CustomerDetailPage from './pages/CustomerDetailPage'

function Home() {
  return <div className="page">welcome to the castle</div>
}

export default function App() {
  return (
    <div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/monsters">Monsters</Link>
        <Link to="/customers">Customers</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
      </Routes>
    </div>
  )
}
