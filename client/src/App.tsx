import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MonsterListPage from './pages/MonsterListPage'

function Home() {
  return <div className="page">welcome to the castle</div>
}

export default function App() {
  return (
    <div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/monsters">Monsters</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/monsters" element={<MonsterListPage />} />
      </Routes>
    </div>
  )
}
