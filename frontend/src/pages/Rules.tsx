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
          <h2>Palpites</h2>
          <p>Faça seu palpite do placar de cada jogo antes do início da partida. Você pode alterar seu palpite até o apito inicial.</p>
        </article>

        <article className="content-card">
          <span className="section-number">02</span>
          <h2>Pontuação</h2>
          <p>Sistema de 6 níveis: de 25 pontos pelo placar exato até 0 por errar o palpite. Quanto mais perto do resultado, mais pontos você ganha!</p>
        </article>

        <article className="content-card">
          <span className="section-number">03</span>
          <h2>Pontos dobrados no mata-mata da Copa</h2>
          <p>Na Copa do Mundo 2026, as partidas do mata-mata valem o dobro. Acertar um placar exato vale 50 pontos, não 25. Procure pelo selo x2 nos cards das partidas.</p>
        </article>

        <article className="content-card">
          <span className="section-number">04</span>
          <h2>Prorrogação</h2>
          <p>Se a partida for para a prorrogação, o placar final considerado será o do fim da prorrogação (90min + 30min). Pênaltis não contam.</p>
        </article>

        <article className="content-card">
          <span className="section-number">05</span>
          <h2>Prazo</h2>
          <p>Os palpites são bloqueados no horário previsto do jogo ou no pontapé inicial, o que ocorrer primeiro. Fique atento aos horários dos jogos!</p>
        </article>

        <article className="content-card">
          <span className="section-number">06</span>
          <h2>Ranking</h2>
          <p>Os pontos de todos os jogos são somados para formar o ranking do bolão. Vence quem tiver mais pontos ao final!</p>
        </article>

        <article className="content-card">
          <span className="section-number">07</span>
          <h2>Critério de desempate</h2>
          <p>Quando dois jogadores terminam com a mesma pontuação, o desempate considera a qualidade dos acertos, nesta ordem: mais placares exatos, depois mais acertos de vencedor + gols do vencedor, saldo de gols, gols do perdedor e, por fim, vencedor certo. Permanecendo o empate, fica à frente quem entrou primeiro no bolão.</p>
        </article>
      </section>
    </AppShell>
  )
}
