import { useAuth } from '../contexts/useAuth'

export function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Bolao da Copa</p>
          <strong>EloGroup</strong>
        </div>
        <button type="button" className="ghost-button" onClick={signOut}>
          Sair
        </button>
      </nav>

      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Sessao ativa</p>
          <h1>Bem-vindo ao Bolao</h1>
          <p className="muted">Conta conectada: {user?.email}</p>
        </div>
        <div className="deadline-card">
          <span>Prazo dos palpites</span>
          <strong>13/jun as 15h</strong>
        </div>
      </section>

      <section className="feature-grid">
        <article>
          <span>01</span>
          <h2>Jogos da Copa</h2>
          <p>Proxima fase: integrar API real e exibir calendario dos jogos.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Palpites</h2>
          <p>Depois da lista de jogos, usuarios poderao salvar placares no banco.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Ranking</h2>
          <p>O ranking sera calculado conforme resultados oficiais e regras do bolao.</p>
        </article>
      </section>
    </main>
  )
}
