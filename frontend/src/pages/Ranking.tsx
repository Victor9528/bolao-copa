import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

type RankingRow = {
  rank_position: number
  user_id: string
  display_name: string
  total_points: number
  predictions_count: number
}

export function Ranking() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadRanking() {
      setLoading(true)
      setError('')

      const { data, error: rankingError } = await supabase
        .from('ranking')
        .select('rank_position, user_id, display_name, total_points, predictions_count')
        .order('rank_position', { ascending: true })

      if (!active) return

      if (rankingError) {
        setError('Nao foi possivel carregar o ranking.')
        setLoading(false)
        return
      }

      setRanking((data ?? []) as RankingRow[])
      setLoading(false)
    }

    loadRanking()

    return () => {
      active = false
    }
  }, [])

  const currentUserRow = ranking.find((row) => row.user_id === user?.id)

  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Ranking</h1>
          <p>{loading ? 'Carregando classificacao' : `${ranking.length} participantes`}</p>
        </div>
        {currentUserRow && <strong>Sua posicao: #{currentUserRow.rank_position}</strong>}
      </header>

      {error && <div className="page-alert">{error}</div>}

      <section className="content-card ranking-page-card">
        {loading && <p className="soft-text">Carregando ranking...</p>}

        {!loading && ranking.length === 0 && (
          <p className="soft-text">O ranking aparecera aqui quando houver participantes.</p>
        )}

        {!loading && ranking.length > 0 && (
          <ol className="ranking-table">
            {ranking.map((row) => (
              <li className={row.user_id === user?.id ? 'current-user' : ''} key={row.user_id}>
                <span className="rank-number">{row.rank_position}</span>
                <strong>{row.display_name}</strong>
                <span>{row.predictions_count} palpites</span>
                <em>{row.total_points} pts</em>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  )
}
