import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

type RankingRow = {
  rank_position: number
  display_name: string
  total_points: number
  predictions_count: number
}

type DashboardData = {
  displayName: string
  matchesCount: number
  predictionsCount: number
  ranking: RankingRow[]
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let active = true
    const currentUser = user

    async function loadDashboard() {
      setLoading(true)
      setError('')

      const [profileResult, matchesResult, predictionsResult, rankingResult] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', currentUser.id).maybeSingle(),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('predictions').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id),
        supabase
          .from('ranking')
          .select('rank_position, display_name, total_points, predictions_count')
          .order('rank_position', { ascending: true })
          .limit(5),
      ])

      if (!active) return

      const firstError = profileResult.error || matchesResult.error || predictionsResult.error || rankingResult.error

      if (firstError) {
        setError('Nao foi possivel carregar os dados do bolao. Confira se as migrations do Supabase foram aplicadas.')
        setLoading(false)
        return
      }

      setData({
        displayName: profileResult.data?.display_name || currentUser.email || 'Participante',
        matchesCount: matchesResult.count ?? 0,
        predictionsCount: predictionsResult.count ?? 0,
        ranking: (rankingResult.data ?? []) as RankingRow[],
      })
      setLoading(false)
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [user])

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

      {error && <div className="dashboard-alert">{error}</div>}

      <section className="stats-grid" aria-label="Resumo do bolao">
        <article>
          <span>Participante</span>
          <strong>{loading ? 'Carregando...' : data?.displayName}</strong>
        </article>
        <article>
          <span>Jogos cadastrados</span>
          <strong>{loading ? '-' : data?.matchesCount}</strong>
        </article>
        <article>
          <span>Seus palpites</span>
          <strong>{loading ? '-' : data?.predictionsCount}</strong>
        </article>
      </section>

      <section className="feature-grid">
        <article>
          <span>01</span>
          <h2>Jogos da Copa</h2>
          <p>{data?.matchesCount ? 'Jogos prontos para receber palpites.' : 'Nenhum jogo cadastrado ainda.'}</p>
          <Link className="card-link" to="/jogos">
            Ver jogos
          </Link>
        </article>
        <article>
          <span>02</span>
          <h2>Palpites</h2>
          <p>Voce podera registrar placares ate 13/jun as 15h.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Ranking</h2>
          <p>Pontuacao calculada automaticamente quando os resultados forem atualizados.</p>
        </article>
      </section>

      <section className="ranking-card">
        <div>
          <p className="eyebrow">Top 5</p>
          <h2>Ranking geral</h2>
        </div>

        {loading && <p className="muted">Carregando ranking...</p>}

        {!loading && data?.ranking.length === 0 && (
          <p className="muted">O ranking aparecera aqui quando houver participantes e pontuacao.</p>
        )}

        {!loading && Boolean(data?.ranking.length) && (
          <ol className="ranking-list">
            {data?.ranking.map((row) => (
              <li key={`${row.rank_position}-${row.display_name}`}>
                <span>{row.rank_position}</span>
                <strong>{row.display_name}</strong>
                <em>{row.total_points} pts</em>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
