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

      <section className="scoring-strip">
        <strong>Pontos por jogada</strong>
        <span><b>25</b> placar exato</span>
        <span><b>10</b> vencedor</span>
        <span><b>0</b> erro</span>
        <Link to="/regulamento">Ver detalhes</Link>
      </section>

      {children}
    </main>
  )
}
