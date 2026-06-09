import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function Rules() {
  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Regulamento</h1>
          <p>Regras oficiais do bolao</p>
        </div>
        <strong>Prazo: 13/jun 15h</strong>
      </header>

      <section className="rules-grid">
        <article className="content-card">
          <span className="section-number">01</span>
          <h2>Como participar</h2>
          <p>Crie sua conta, acesse a tela de jogos e preencha o placar de cada partida antes do prazo final.</p>
          <Link className="primary-link" to="/jogos">Preencher palpites</Link>
        </article>

        <article className="content-card">
          <span className="section-number">02</span>
          <h2>Pontuacao</h2>
          <ul className="rules-list">
            <li><strong>4 pontos</strong> para placar exato.</li>
            <li><strong>2 pontos</strong> para vencedor correto ou empate correto.</li>
            <li><strong>0 ponto</strong> para resultado incorreto.</li>
          </ul>
        </article>

        <article className="content-card">
          <span className="section-number">03</span>
          <h2>Jogos sem pontuacao</h2>
          <p>Os quatro primeiros jogos da Copa nao contam pontos no ranking, mesmo que o palpite esteja salvo.</p>
        </article>

        <article className="content-card">
          <span className="section-number">04</span>
          <h2>Ranking</h2>
          <p>O ranking soma automaticamente os pontos dos palpites quando os resultados oficiais forem atualizados.</p>
          <Link className="primary-link" to="/ranking">Ver ranking</Link>
        </article>
      </section>
    </AppShell>
  )
}
