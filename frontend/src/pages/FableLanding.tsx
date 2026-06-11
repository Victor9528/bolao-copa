import { Link } from 'react-router-dom'
import { FableCountdown } from '../components/FableCountdown'
import { FableMatchPredictionCard, type FableMatch } from '../components/FableMatchPredictionCard'
import { FablePitchLines } from '../components/FablePitchLines'

const PREDICTIONS_DEADLINE = new Date('2026-06-13T15:00:00-03:00')

const upcomingMatches: FableMatch[] = [
  {
    id: 'm1',
    home: { name: 'México', code: 'MEX', flag: '🇲🇽' },
    away: { name: 'África do Sul', code: 'RSA', flag: '🇿🇦' },
    kickoff: '2026-06-11T20:00:00-03:00',
    stadium: 'Estádio Azteca · Cidade do México',
    group: 'A',
    countsForPoints: false,
  },
  {
    id: 'm2',
    home: { name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
    away: { name: 'Itália', code: 'ITA', flag: '🇮🇹' },
    kickoff: '2026-06-12T17:00:00-03:00',
    stadium: 'BMO Field · Toronto',
    group: 'B',
    countsForPoints: false,
  },
  {
    id: 'm3',
    home: { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
    away: { name: 'Marrocos', code: 'MAR', flag: '🇲🇦' },
    kickoff: '2026-06-13T18:00:00-03:00',
    stadium: 'MetLife Stadium · Nova Jersey',
    group: 'C',
    countsForPoints: true,
  },
  {
    id: 'm4',
    home: { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
    away: { name: 'Japão', code: 'JPN', flag: '🇯🇵' },
    kickoff: '2026-06-13T21:00:00-03:00',
    stadium: 'SoFi Stadium · Los Angeles',
    group: 'D',
    countsForPoints: true,
  },
]

const ranking = [
  { position: 1, name: 'Ana Beltrão', points: 0, exactScores: 0 },
  { position: 2, name: 'Carlos Mota', points: 0, exactScores: 0 },
  { position: 3, name: 'Victor Souza', points: 0, exactScores: 0 },
  { position: 4, name: 'Júlia Ferreira', points: 0, exactScores: 0 },
  { position: 5, name: 'Rafael Clemente', points: 0, exactScores: 0 },
]

const scoringRules = [
  { points: 10, rule: 'Placar exato', detail: 'Acertou o resultado e o número de gols dos dois times.' },
  { points: 5, rule: 'Vencedor + saldo', detail: 'Acertou quem venceu e a diferença de gols.' },
  { points: 3, rule: 'Vencedor ou empate', detail: 'Acertou apenas o resultado da partida.' },
  { points: 0, rule: 'Errou o resultado', detail: 'Sem pontos. Bola pra frente, o próximo jogo vem aí.' },
]

export function FableLanding() {
  return (
    <div className="fable-theme min-h-screen bg-fable-background text-fable-foreground">
      <SiteHeader />

      <main>
        <Hero />
        <UpcomingMatches />
        <RankingSection />
        <ScoringSection />
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteHeader() {
  const navLinks = [
    { to: '/jogos', label: 'Jogos' },
    { to: '/jogos', label: 'Meus palpites' },
    { to: '/ranking', label: 'Ranking' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-fable-border bg-fable-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/fable-5" className="flex items-center gap-2.5 text-fable-foreground no-underline">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-fable-gold font-fable-score text-lg font-bold text-fable-gold"
            aria-hidden
          >
            26
          </span>
          <span className="font-fable-display text-sm uppercase tracking-wide sm:text-base">
            Bolão da Copa
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={`${link.to}-${link.label}`}
              to={link.to}
              className="text-sm font-medium text-fable-muted no-underline transition-colors hover:text-fable-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/login"
          className="rounded-lg bg-fable-primary px-4 py-2 font-fable-score text-sm font-semibold uppercase tracking-wide text-fable-primary-foreground no-underline transition-colors hover:bg-fable-primary/85"
        >
          Entrar
        </Link>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-fable-border">
      <FablePitchLines className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--fable-primary)/0.10),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-fable-gold/30 bg-fable-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fable-gold-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-fable-gold" aria-hidden />
          Copa do Mundo 2026 · EUA · Canadá · México
        </p>

        <h1 className="max-w-3xl font-fable-display text-4xl uppercase leading-[1.05] sm:text-6xl">
          Seu palpite vale
          <span className="block text-fable-gold">uma camisa da Seleção</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-fable-muted sm:text-lg">
          Cadastre seus placares para cada jogo da Copa, acompanhe a pontuação em tempo real e dispute o topo do ranking com a galera. Quanto mais exato o palpite, mais pontos.
        </p>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/jogos"
              className="rounded-xl bg-fable-primary px-6 py-3.5 font-fable-score text-base font-bold uppercase tracking-wide text-fable-primary-foreground no-underline transition-transform hover:bg-fable-primary/85 active:scale-[0.98]"
            >
              Fazer meus palpites
            </Link>
            <Link
              to="/regulamento"
              className="rounded-xl border border-fable-border px-6 py-3.5 font-fable-score text-base font-semibold uppercase tracking-wide text-fable-foreground no-underline transition-colors hover:border-fable-gold/40 hover:bg-fable-surface"
            >
              Como funciona
            </Link>
          </div>

          <FableCountdown target={PREDICTIONS_DEADLINE} label="Palpites fecham sábado, 15h" />
        </div>
      </div>
    </section>
  )
}

function UpcomingMatches() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="proximos-jogos">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-fable-gold-soft">
            Rodada de abertura
          </p>
          <h2 id="proximos-jogos" className="font-fable-display text-2xl uppercase sm:text-3xl">
            Próximos jogos
          </h2>
        </div>
        <Link
          to="/jogos"
          className="font-fable-score text-sm font-semibold uppercase tracking-wide text-fable-muted no-underline transition-colors hover:text-fable-gold"
        >
          Ver tabela completa →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {upcomingMatches.map((match) => (
          <FableMatchPredictionCard key={match.id} match={match} />
        ))}
      </div>

      <p className="mt-6 text-xs text-fable-muted">
        Os jogos de 11 e 12 de junho não pontuam para o bolão. Eles servem de aquecimento enquanto os palpites estão abertos.
      </p>
    </section>
  )
}

function RankingSection() {
  return (
    <section className="border-y border-fable-border bg-fable-surface/50" aria-labelledby="ranking">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-fable-gold-soft">
            Classificação geral
          </p>
          <h2 id="ranking" className="font-fable-display text-2xl uppercase sm:text-3xl">
            Ranking
          </h2>
        </div>

        <ol className="overflow-hidden rounded-2xl border border-fable-border bg-fable-surface">
          {ranking.map((player, i) => (
            <li
              key={player.name}
              className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-5 py-4 ${
                i > 0 ? 'border-t border-fable-border' : ''
              } ${player.position === 1 ? 'bg-fable-gold/[0.06]' : ''}`}
            >
              <span
                className={`font-fable-score text-2xl font-bold tabular-nums ${
                  player.position === 1 ? 'text-fable-gold' : 'text-fable-muted'
                }`}
              >
                {String(player.position).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{player.name}</p>
                <p className="text-xs text-fable-muted">{player.exactScores} placares exatos</p>
              </div>
              <span className="font-fable-score text-2xl font-bold tabular-nums">
                {player.points}
                <span className="ml-1 text-xs font-semibold uppercase text-fable-muted">pts</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-xs text-fable-muted">
          O ranking abre zerado. A pontuação começa a contar a partir dos jogos de 13 de junho.
        </p>
      </div>
    </section>
  )
}

function ScoringSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="pontuacao">
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-fable-gold-soft">
          Regras simples
        </p>
        <h2 id="pontuacao" className="font-fable-display text-2xl uppercase sm:text-3xl">
          Como você pontua
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scoringRules.map((item) => (
          <div
            key={item.rule}
            className="rounded-2xl border border-fable-border bg-fable-surface p-5 transition-colors hover:border-fable-gold/40"
          >
            <p className="font-fable-score text-5xl font-bold tabular-nums text-fable-gold">
              {item.points}
              <span className="ml-1 text-sm font-semibold uppercase text-fable-muted">pts</span>
            </p>
            <p className="mt-3 font-fable-score text-lg font-bold uppercase tracking-wide">{item.rule}</p>
            <p className="mt-1 text-sm leading-relaxed text-fable-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-fable-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-fable-muted sm:flex-row sm:items-center sm:px-6">
        <p>
          Bolão da Copa 2026 · <span className="text-fable-gold-soft">AI World Cup Challenge</span>
        </p>
        <nav aria-label="Rodapé" className="flex gap-6">
          <Link to="/regulamento" className="text-fable-muted no-underline transition-colors hover:text-fable-foreground">
            Regulamento
          </Link>
          <Link to="/ranking" className="text-fable-muted no-underline transition-colors hover:text-fable-foreground">
            Ranking
          </Link>
        </nav>
      </div>
    </footer>
  )
}
