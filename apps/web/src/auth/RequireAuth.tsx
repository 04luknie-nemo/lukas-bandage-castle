import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasRole, type Role } from '@bandage/shared'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="page">Opening the castle gates... 🏰</p>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !hasRole(user, ...roles)) {
    return (
      <div className="page">
        <h2>🚫 Not for you</h2>
        <p>Your role can't open this door.</p>
      </div>
    )
  }
  return <>{children}</>
}
