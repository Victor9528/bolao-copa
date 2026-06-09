import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/useAuth'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { signOut } = useAuth()

  return (
    <main className="games-shell">
      <nav className="topbar app-topbar">
        <Link className="brand-link" to="/">
          <p className="eyebrow">Bolao da Copa</p>
          <strong>EloGroup</strong>
        </Link>
        <div className="topbar-actions">
          <Link className="ghost-link" to="/perfil">
            Perfil
          </Link>
          <button type="button" className="ghost-button" onClick={signOut}>
            Sair
          </button>
        </div>
      </nav>

      {children}
    </main>
  )
}
