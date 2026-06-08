import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return <main className="auth-shell">Carregando sessao...</main>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
