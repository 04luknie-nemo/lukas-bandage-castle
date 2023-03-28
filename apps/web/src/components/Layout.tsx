import { Link, Outlet, useNavigate } from 'react-router-dom'
import { hasRole } from '@bandage/shared'
import { useAuth } from '../auth/AuthProvider'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const staff = hasRole(user, 'ADMIN', 'FRONT_DESK', 'KEEPER', 'VET')

  const doLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div>
      <nav className="nav">
        {user && (
          <span className="nav-user">
            {user.name || user.email} <button onClick={doLogout}>log out</button>
          </span>
        )}
        <Link to="/">Home</Link>
        <Link to="/species">Species</Link>
        {staff && (
          <>
            <Link to="/monsters">Monsters</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/stays">Stays</Link>
            <Link to="/invoices">Invoices</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}
        {hasRole(user, 'OWNER') && (
          <>
            <Link to="/my/monsters">My monsters</Link>
            <Link to="/my/invoices">My invoices</Link>
          </>
        )}
        {hasRole(user, 'ADMIN') && <Link to="/admin/users">Users</Link>}
      </nav>
      <Outlet />
    </div>
  )
}
