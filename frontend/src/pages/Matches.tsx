import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import {
  formatMatchTime,
  getTeamPresentation,
  getRoundFilterForIndex,
  getRoundTitle,
  getScoreLabel,
  roundFilters,
  groupMatchesByDay,
} from '../lib/matches'
import type { Match, RoundFilter } from '../lib/matches'

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

type PredictionPayload = {
  home_score: number
  away_score: number
}

type StatusFilter = 'upcoming' | 'finished'

const predictionDeadline = new Date('2026-06-13T18:00:00.000Z')

function isPredictionLocked(match: Match) {
  return new Date().getTime() >= new Date(match.starts_at).getTime() || match.status !== 'scheduled'
}

function getPredictionLockLabel(match: Match) {
  if (match.status === 'live') return 'Jogo em andamento'
  if (match.status === 'finished') return 'Jogo encerrado'
  if (new Date().getTime() >= new Date(match.starts_at).getTime()) return 'Palpite bloqueado'
  return ''
}

export function Matches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [drafts, setDrafts] = useState<Record<number, PredictionDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [predictionsOpen] = useState(() => new Date().getTime() < predictionDeadline.getTime())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming')
  const [roundFilter, setRoundFilter] = useState<RoundFilter>('all')
  const [guidedOpen, setGuidedOpen] = useState(false)

  const completedPredictions = useMemo(
    () => Object.values(drafts).filter((draft) => draft.home_score !== '' && draft.away_score !== '').length,
    [drafts],
  )

  const filteredMatches = useMemo(() => {
    return matches.filter((match, index) => {
      const statusMatches = statusFilter === 'finished' ? match.status === 'finished' : match.status !== 'finished'
      const roundMatches = roundFilter === 'all' || getRoundFilterForIndex(index) === roundFilter
      return statusMatches && roundMatches
    })
  }, [matches, roundFilter, statusFilter])

  const groupedMatches = useMemo(() => groupMatchesByDay(filteredMatches), [filteredMatches])

  const pendingGuidedMatches = useMemo(
    () => matches.filter((match) => predictionsOpen && !isPredictionLocked(match) && !predictions[match.id]),
    [matches, predictions, predictionsOpen],
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

  async function persistPrediction(match: Match, payload: PredictionPayload) {
    if (!user || !predictionsOpen) return false

    if (isPredictionLocked(match)) {
      setMessage('Este jogo ja comecou ou foi encerrado. O palpite esta bloqueado.')
      return false
    }

    setSavingMatchId(match.id)
    setMessage('')
    setError('')

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
      return false
    }

    const savedPrediction = result.data as Prediction
    setPredictions((current) => ({ ...current, [match.id]: savedPrediction }))
    setDrafts((current) => ({
      ...current,
      [match.id]: {
        home_score: String(payload.home_score),
        away_score: String(payload.away_score),
      },
    }))
    setMessage(`Palpite salvo: ${match.home_team} ${payload.home_score} x ${payload.away_score} ${match.away_team}`)
    return true
  }

  async function savePrediction(match: Match) {
    const draft = drafts[match.id]

    if (!draft || draft.home_score === '' || draft.away_score === '') {
      setMessage('Preencha os dois placares antes de salvar.')
      return
    }

    await persistPrediction(match, {
      home_score: Number(draft.home_score),
      away_score: Number(draft.away_score),
    })
  }

  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Jogos</h1>
          <p>Palpites salvos: {loading ? '-' : `${completedPredictions}/${matches.length}`}</p>
        </div>
        <strong>{matches.length} jogos</strong>
      </header>

      <section className="games-filters" aria-label="Filtros dos jogos">
        <div className="status-pills">
          <button className={statusFilter === 'upcoming' ? 'active' : ''} type="button" onClick={() => setStatusFilter('upcoming')}>
            Proximos
          </button>
          <button className={statusFilter === 'finished' ? 'active' : ''} type="button" onClick={() => setStatusFilter('finished')}>
            Encerrados
          </button>
        </div>

        <div className="round-pills">
          {roundFilters.map((filter) => (
            <button className={roundFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => setRoundFilter(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {!predictionsOpen && (
        <div className="dashboard-alert">O prazo de envio de palpites terminou. Os placares ficam bloqueados.</div>
      )}

      {message && <div className="success-alert">{message}</div>}
      {error && <div className="dashboard-alert">{error}</div>}

      {predictionsOpen && pendingGuidedMatches.length > 0 && (
        <div className="guided-entry-bar">
          <button
            className="ghost-button"
            onClick={() => setGuidedOpen(true)}
            type="button"
          >
            Preencher pendentes ({pendingGuidedMatches.length})
          </button>
        </div>
      )}

      {guidedOpen && (
        <GuidedPredictionModal
          matches={pendingGuidedMatches}
          onClose={() => setGuidedOpen(false)}
          onSave={persistPrediction}
          savingMatchId={savingMatchId}
        />
      )}

      {loading && <section className="games-empty">Carregando jogos...</section>}

      {!loading && matches.length === 0 && (
        <section className="games-empty">
          <h2>Nenhum jogo cadastrado</h2>
          <p className="muted">Sincronize os jogos pelo backend para liberar os palpites.</p>
        </section>
      )}

      {!loading && matches.length > 0 && groupedMatches.length === 0 && (
        <section className="games-empty">Nenhum jogo encontrado para este filtro.</section>
      )}

      {!loading && groupedMatches.length > 0 && (
        <section className="games-board" aria-label="Lista de jogos">
          <div className="round-title">{roundFilter === 'all' ? 'Todas as rodadas' : getRoundTitle(roundFilter)}</div>

          {groupedMatches.map((group) => (
            <div className="day-group" key={group.day}>
              <h2>{group.day}</h2>
              <div className="games-grid">
                {group.matches.map((match) => {
                  const draft = drafts[match.id] ?? { home_score: '', away_score: '' }
                  const prediction = predictions[match.id]
                  const lockLabel = getPredictionLockLabel(match)
                  const disabled = !predictionsOpen || isPredictionLocked(match) || savingMatchId === match.id
                  const home = getTeamPresentation(match.home_team)
                  const away = getTeamPresentation(match.away_team)

                  return (
                    <article className="game-card" key={match.id}>
                      <div className="game-card-info">
                        <time>{formatMatchTime(match.starts_at)}</time>
                        <span>{lockLabel || (match.counts_for_pool ? 'Pontua' : 'Nao pontua')}</span>
                      </div>

                      <div className="game-card-field">
                        <div className="team-block">
                          {home.flagCode ? <img alt="" src={`https://flagcdn.com/w80/${home.flagCode}.png`} /> : <div className="flag-fallback" />}
                          <strong>{home.code}</strong>
                        </div>

                        <div className="compact-score">
                          <input
                            aria-label={`Palpite ${match.home_team}`}
                            disabled={disabled}
                            inputMode="numeric"
                            max="99"
                            min="0"
                            onChange={(event) => updateDraft(match.id, 'home_score', event)}
                            type="number"
                            value={draft.home_score}
                          />
                          <span>x</span>
                          <input
                            aria-label={`Palpite ${match.away_team}`}
                            disabled={disabled}
                            inputMode="numeric"
                            max="99"
                            min="0"
                            onChange={(event) => updateDraft(match.id, 'away_score', event)}
                            type="number"
                            value={draft.away_score}
                          />
                        </div>

                        <div className="team-block">
                          {away.flagCode ? <img alt="" src={`https://flagcdn.com/w80/${away.flagCode}.png`} /> : <div className="flag-fallback" />}
                          <strong>{away.code}</strong>
                        </div>
                      </div>

                      <div className="game-card-footer">
                        <span>{getScoreLabel(match)}</span>
                        {prediction && <span>{prediction.points} pts</span>}
                        <button disabled={disabled} onClick={() => savePrediction(match)} type="button">
                          {lockLabel ? 'Bloqueado' : savingMatchId === match.id ? 'Salvando' : prediction ? 'Atualizar' : 'Salvar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  )
}

type GuidedPredictionModalProps = {
  matches: Match[]
  savingMatchId: number | null
  onClose: () => void
  onSave: (match: Match, payload: PredictionPayload) => Promise<boolean>
}

function GuidedPredictionModal({ matches, savingMatchId, onClose, onSave }: GuidedPredictionModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeSide, setActiveSide] = useState<keyof PredictionDraft>('home_score')
  const [score, setScore] = useState<PredictionDraft>({ home_score: '', away_score: '' })

  const safeIndex = Math.min(currentIndex, Math.max(0, matches.length - 1))
  const currentMatch = matches[safeIndex]
  const home = currentMatch ? getTeamPresentation(currentMatch.home_team) : null
  const away = currentMatch ? getTeamPresentation(currentMatch.away_team) : null
  const canGoNext = score.home_score !== '' && score.away_score !== '' && !!currentMatch
  const saving = !!currentMatch && savingMatchId === currentMatch.id

  function resetEntry() {
    setScore({ home_score: '', away_score: '' })
    setActiveSide('home_score')
  }

  if (!currentMatch || !home || !away) return null

  function pressDigit(digit: string) {
    setScore((current) => {
      const nextValue = `${current[activeSide]}${digit}`.slice(0, 2)
      const next = { ...current, [activeSide]: nextValue }

      if (activeSide === 'home_score' && current.home_score === '') {
        window.setTimeout(() => setActiveSide('away_score'), 0)
      }

      return next
    })
  }

  function backspace() {
    setScore((current) => ({
      ...current,
      [activeSide]: current[activeSide].slice(0, -1),
    }))
  }

  function clearActive() {
    setScore((current) => ({ ...current, [activeSide]: '' }))
  }

  function skipMatch() {
    resetEntry()

    if (safeIndex >= matches.length - 1) {
      onClose()
      return
    }

    setCurrentIndex((current) => current + 1)
  }

  async function saveAndNext() {
    if (!canGoNext || saving) return

    const saved = await onSave(currentMatch, {
      home_score: Number(score.home_score),
      away_score: Number(score.away_score),
    })

    if (!saved) return

    if (matches.length <= 1) {
      onClose()
    } else {
      resetEntry()
    }
  }

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="guided-modal-backdrop" role="presentation">
      <section className="guided-modal" aria-labelledby="guided-title" role="dialog" aria-modal="true">
        <header className="guided-modal-header">
          <div>
            <p className="eyebrow">Palpite guiado</p>
            <h2 id="guided-title">Partida {safeIndex + 1} de {matches.length}</h2>
          </div>
          <button aria-label="Fechar palpite guiado" className="guided-close" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <p className="guided-match-time">{formatMatchTime(currentMatch.starts_at)} · {currentMatch.counts_for_pool ? 'Pontua' : 'Nao pontua'}</p>

        <div className="guided-scoreboard">
          <button
            className={`guided-team ${activeSide === 'home_score' ? 'active' : ''}`}
            onClick={() => setActiveSide('home_score')}
            type="button"
          >
            {home.flagCode ? <img alt="" src={`https://flagcdn.com/w80/${home.flagCode}.png`} /> : <span className="flag-fallback" />}
            <span>{home.code}</span>
            <strong>{score.home_score || '-'}</strong>
          </button>

          <span className="guided-versus">x</span>

          <button
            className={`guided-team ${activeSide === 'away_score' ? 'active' : ''}`}
            onClick={() => setActiveSide('away_score')}
            type="button"
          >
            {away.flagCode ? <img alt="" src={`https://flagcdn.com/w80/${away.flagCode}.png`} /> : <span className="flag-fallback" />}
            <span>{away.code}</span>
            <strong>{score.away_score || '-'}</strong>
          </button>
        </div>

        <p className="guided-active-hint">
          Digitando gols de <strong>{activeSide === 'home_score' ? currentMatch.home_team : currentMatch.away_team}</strong>
        </p>

        <div className="guided-keypad" aria-label="Teclado numerico de gols">
          {keypad.map((digit) => (
            <button key={digit} onClick={() => pressDigit(digit)} type="button">
              {digit}
            </button>
          ))}
          <button className="guided-keypad-secondary" onClick={clearActive} type="button">Limpar</button>
          <button onClick={() => pressDigit('0')} type="button">0</button>
          <button className="guided-keypad-secondary" onClick={backspace} type="button">←</button>
        </div>

        <footer className="guided-modal-footer">
          <button className="ghost-button" onClick={skipMatch} type="button">Pular</button>
          <button className="hero-cta" disabled={!canGoNext || saving} onClick={saveAndNext} type="button">
            {saving ? 'Salvando...' : matches.length <= 1 ? 'Finalizar' : 'Proximo'}
          </button>
        </footer>
      </section>
    </div>
  )
}
