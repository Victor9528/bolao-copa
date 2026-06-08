import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

type Match = {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  starts_at: string
  status: 'scheduled' | 'live' | 'finished'
  counts_for_pool: boolean
}

type Prediction = {
  id: number
  match_id: number
  home_score: number
  away_score: number
  points: number
}

type PredictionDraft = {
  home_score: string
  away_score: string
}

const predictionDeadline = new Date('2026-06-13T18:00:00.000Z')

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}

function getScoreLabel(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return match.status === 'scheduled' ? 'Aguardando jogo' : 'Sem placar'
  }

  return `${match.home_score} x ${match.away_score}`
}

export function Matches() {
  const { user, signOut } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [drafts, setDrafts] = useState<Record<number, PredictionDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [predictionsOpen] = useState(() => new Date().getTime() < predictionDeadline.getTime())

  const completedPredictions = useMemo(
    () => Object.values(drafts).filter((draft) => draft.home_score !== '' && draft.away_score !== '').length,
    [drafts],
  )

  useEffect(() => {
    if (!user) return

    let active = true
    const currentUser = user

    async function loadMatches() {
      setLoading(true)
      setError('')

      const [matchesResult, predictionsResult] = await Promise.all([
        supabase
          .from('matches')
          .select('id, home_team, away_team, home_score, away_score, starts_at, status, counts_for_pool')
          .order('starts_at', { ascending: true }),
        supabase
          .from('predictions')
          .select('id, match_id, home_score, away_score, points')
          .eq('user_id', currentUser.id),
      ])

      if (!active) return

      if (matchesResult.error || predictionsResult.error) {
        setError('Nao foi possivel carregar jogos e palpites. Tente novamente em instantes.')
        setLoading(false)
        return
      }

      const nextMatches = (matchesResult.data ?? []) as Match[]
      const nextPredictions = ((predictionsResult.data ?? []) as Prediction[]).reduce<Record<number, Prediction>>(
        (acc, prediction) => {
          acc[prediction.match_id] = prediction
          return acc
        },
        {},
      )

      const nextDrafts = nextMatches.reduce<Record<number, PredictionDraft>>((acc, match) => {
        const prediction = nextPredictions[match.id]
        acc[match.id] = {
          home_score: prediction ? String(prediction.home_score) : '',
          away_score: prediction ? String(prediction.away_score) : '',
        }
        return acc
      }, {})

      setMatches(nextMatches)
      setPredictions(nextPredictions)
      setDrafts(nextDrafts)
      setLoading(false)
    }

    loadMatches()

    return () => {
      active = false
    }
  }, [user])

  function updateDraft(matchId: number, field: keyof PredictionDraft, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    if (value !== '' && (!/^\d+$/.test(value) || Number(value) > 99)) return

    setDrafts((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        [field]: value,
      },
    }))
  }

  async function savePrediction(match: Match) {
    if (!user || !predictionsOpen) return

    const draft = drafts[match.id]

    if (!draft || draft.home_score === '' || draft.away_score === '') {
      setMessage('Preencha os dois placares antes de salvar.')
      return
    }

    setSavingMatchId(match.id)
    setMessage('')
    setError('')

    const payload = {
      home_score: Number(draft.home_score),
      away_score: Number(draft.away_score),
    }
    const existingPrediction = predictions[match.id]
    const result = existingPrediction
      ? await supabase
          .from('predictions')
          .update(payload)
          .eq('id', existingPrediction.id)
          .select('id, match_id, home_score, away_score, points')
          .single()
      : await supabase
          .from('predictions')
          .insert({ user_id: user.id, match_id: match.id, ...payload })
          .select('id, match_id, home_score, away_score, points')
          .single()

    setSavingMatchId(null)

    if (result.error) {
      setError(result.error.message)
      return
    }

    const savedPrediction = result.data as Prediction
    setPredictions((current) => ({ ...current, [match.id]: savedPrediction }))
    setMessage(`Palpite salvo: ${match.home_team} ${payload.home_score} x ${payload.away_score} ${match.away_team}`)
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar">
        <div>
          <p className="eyebrow">Bolao da Copa</p>
          <strong>Jogos e palpites</strong>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-link" to="/">
            Dashboard
          </Link>
          <button type="button" className="ghost-button" onClick={signOut}>
            Sair
          </button>
        </div>
      </nav>

      <section className="dashboard-hero matches-hero">
        <div>
          <p className="eyebrow">Sua rodada</p>
          <h1>Registre seus placares</h1>
          <p className="muted">Salve ou edite seus palpites ate 13/jun as 15h. Os quatro primeiros jogos nao pontuam.</p>
        </div>
        <div className="deadline-card">
          <span>Progresso</span>
          <strong>{loading ? '-' : `${completedPredictions}/${matches.length}`}</strong>
        </div>
      </section>

      {!predictionsOpen && (
        <div className="dashboard-alert">O prazo de envio de palpites terminou. Os placares ficam bloqueados.</div>
      )}

      {message && <div className="success-alert">{message}</div>}
      {error && <div className="dashboard-alert">{error}</div>}

      {loading && <section className="ranking-card">Carregando jogos...</section>}

      {!loading && matches.length === 0 && (
        <section className="ranking-card">
          <h2>Nenhum jogo cadastrado</h2>
          <p className="muted">Sincronize os jogos pelo backend para liberar os palpites.</p>
        </section>
      )}

      {!loading && matches.length > 0 && (
        <section className="matches-list" aria-label="Lista de jogos">
          {matches.map((match, index) => {
            const draft = drafts[match.id] ?? { home_score: '', away_score: '' }
            const prediction = predictions[match.id]
            const disabled = !predictionsOpen || savingMatchId === match.id

            return (
              <article className="match-card" key={match.id}>
                <div className="match-meta">
                  <span>Jogo {index + 1}</span>
                  <time>{formatMatchDate(match.starts_at)}</time>
                  {!match.counts_for_pool && <em>Nao pontua</em>}
                </div>

                <div className="match-main">
                  <strong>{match.home_team}</strong>
                  <div className="score-inputs">
                    <input
                      aria-label={`Palpite ${match.home_team}`}
                      inputMode="numeric"
                      min="0"
                      max="99"
                      type="number"
                      value={draft.home_score}
                      onChange={(event) => updateDraft(match.id, 'home_score', event)}
                      disabled={disabled}
                    />
                    <span>x</span>
                    <input
                      aria-label={`Palpite ${match.away_team}`}
                      inputMode="numeric"
                      min="0"
                      max="99"
                      type="number"
                      value={draft.away_score}
                      onChange={(event) => updateDraft(match.id, 'away_score', event)}
                      disabled={disabled}
                    />
                  </div>
                  <strong>{match.away_team}</strong>
                </div>

                <div className="match-footer">
                  <span>Resultado oficial: {getScoreLabel(match)}</span>
                  {prediction && <span>{prediction.points} pts</span>}
                  <button type="button" onClick={() => savePrediction(match)} disabled={disabled}>
                    {savingMatchId === match.id ? 'Salvando...' : prediction ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
