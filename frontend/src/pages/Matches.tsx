import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { AppShell } from '../components/AppShell'
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

type TeamPresentation = {
  code: string
  flagCode?: string
}

type StatusFilter = 'upcoming' | 'finished'
type RoundFilter = 'all' | 'round1' | 'round2' | 'round3' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third' | 'final'

const predictionDeadline = new Date('2026-06-13T18:00:00.000Z')

const roundFilters: Array<{ id: RoundFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'round1', label: '1ª rodada' },
  { id: 'round2', label: '2ª rodada' },
  { id: 'round3', label: '3ª rodada' },
  { id: 'round32', label: 'Fase de 32' },
  { id: 'round16', label: 'Oitavas de final' },
  { id: 'quarter', label: 'Quartas de final' },
  { id: 'semi', label: 'Semifinais' },
  { id: 'third', label: 'Disputa de 3º lugar' },
  { id: 'final', label: 'Final' },
]

const teams: Record<string, TeamPresentation> = {
  Algeria: { code: 'ALG', flagCode: 'dz' },
  Argentina: { code: 'ARG', flagCode: 'ar' },
  Australia: { code: 'AUS', flagCode: 'au' },
  Austria: { code: 'AUT', flagCode: 'at' },
  Belgium: { code: 'BEL', flagCode: 'be' },
  'Bosnia and Herzegovina': { code: 'BIH', flagCode: 'ba' },
  Brazil: { code: 'BRA', flagCode: 'br' },
  Canada: { code: 'CAN', flagCode: 'ca' },
  'Cape Verde': { code: 'CPV', flagCode: 'cv' },
  Colombia: { code: 'COL', flagCode: 'co' },
  Croatia: { code: 'CRO', flagCode: 'hr' },
  Curaçao: { code: 'CUW', flagCode: 'cw' },
  Czechia: { code: 'CZE', flagCode: 'cz' },
  Denmark: { code: 'DEN', flagCode: 'dk' },
  'DR Congo': { code: 'COD', flagCode: 'cd' },
  Ecuador: { code: 'ECU', flagCode: 'ec' },
  Egypt: { code: 'EGY', flagCode: 'eg' },
  England: { code: 'ENG', flagCode: 'gb-eng' },
  France: { code: 'FRA', flagCode: 'fr' },
  Germany: { code: 'GER', flagCode: 'de' },
  Ghana: { code: 'GHA', flagCode: 'gh' },
  Haiti: { code: 'HAI', flagCode: 'ht' },
  Iran: { code: 'IRN', flagCode: 'ir' },
  Iraq: { code: 'IRQ', flagCode: 'iq' },
  Italy: { code: 'ITA', flagCode: 'it' },
  'Ivory Coast': { code: 'CIV', flagCode: 'ci' },
  Japan: { code: 'JPN', flagCode: 'jp' },
  Jordan: { code: 'JOR', flagCode: 'jo' },
  Mexico: { code: 'MEX', flagCode: 'mx' },
  Morocco: { code: 'MAR', flagCode: 'ma' },
  Netherlands: { code: 'NED', flagCode: 'nl' },
  'New Zealand': { code: 'NZL', flagCode: 'nz' },
  Norway: { code: 'NOR', flagCode: 'no' },
  Panama: { code: 'PAN', flagCode: 'pa' },
  Paraguay: { code: 'PAR', flagCode: 'py' },
  Poland: { code: 'POL', flagCode: 'pl' },
  Portugal: { code: 'POR', flagCode: 'pt' },
  Qatar: { code: 'QAT', flagCode: 'qa' },
  'Saudi Arabia': { code: 'KSA', flagCode: 'sa' },
  Scotland: { code: 'SCO', flagCode: 'gb-sct' },
  Senegal: { code: 'SEN', flagCode: 'sn' },
  Serbia: { code: 'SRB', flagCode: 'rs' },
  'South Africa': { code: 'RSA', flagCode: 'za' },
  'South Korea': { code: 'KOR', flagCode: 'kr' },
  Spain: { code: 'ESP', flagCode: 'es' },
  Sweden: { code: 'SWE', flagCode: 'se' },
  Switzerland: { code: 'SUI', flagCode: 'ch' },
  Tunisia: { code: 'TUN', flagCode: 'tn' },
  Türkiye: { code: 'TUR', flagCode: 'tr' },
  Uruguay: { code: 'URU', flagCode: 'uy' },
  USA: { code: 'USA', flagCode: 'us' },
  Uzbekistan: { code: 'UZB', flagCode: 'uz' },
}

function formatMatchDay(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value)).toUpperCase()
}

function formatMatchTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}

function getTeamPresentation(teamName: string) {
  return teams[teamName] ?? {
    code: teamName
      .split(/\s|-/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'TBD',
  }
}

function getRoundFilterForIndex(index: number): RoundFilter {
  if (index < 24) return 'round1'
  if (index < 48) return 'round2'
  if (index < 72) return 'round3'
  if (index < 88) return 'round32'
  if (index < 96) return 'round16'
  if (index < 100) return 'quarter'
  if (index < 102) return 'semi'
  if (index === 102) return 'third'
  return 'final'
}

function getRoundTitle(roundFilter: RoundFilter) {
  return roundFilters.find((filter) => filter.id === roundFilter)?.label ?? 'Jogos'
}

function getScoreLabel(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return match.status === 'scheduled' ? 'Aguardando jogo' : 'Sem placar'
  }

  return `${match.home_score} x ${match.away_score}`
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
  const [hasDefaults, setHasDefaults] = useState(false)

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

  const groupedMatches = useMemo(() => {
    return filteredMatches.reduce<Array<{ day: string; matches: Match[] }>>((acc, match) => {
      const day = formatMatchDay(match.starts_at)
      const currentGroup = acc[acc.length - 1]

      if (currentGroup?.day === day) {
        currentGroup.matches.push(match)
      } else {
        acc.push({ day, matches: [match] })
      }

      return acc
    }, [])
  }, [filteredMatches])

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

      const { count } = await supabase
        .from('default_predictions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      if (!active) return
      setHasDefaults((count ?? 0) > 0)

      setLoading(false)
    }

    loadMatches()

    return () => {
      active = false
    }
  }, [user])

  async function fillWithDefaults() {
    if (!user) return

    const { data: defaults } = await supabase
      .from('default_predictions')
      .select('match_id, home_score, away_score')
      .eq('user_id', user.id)

    if (!defaults || defaults.length === 0) {
      setMessage('Nenhum palpite padrao salvo. Va em Perfil para definir.')
      return
    }

    const defaultMap = new Map(defaults.map(d => [d.match_id, d]))
    const filled: Record<number, PredictionDraft> = {}

    for (const match of matches) {
      const current = drafts[match.id]
      const def = defaultMap.get(match.id)

      if (current?.home_score === '' && current?.away_score === '' && def) {
        filled[match.id] = {
          home_score: String(def.home_score),
          away_score: String(def.away_score),
        }
      }
    }

    if (Object.keys(filled).length === 0) {
      setMessage('Todos os jogos ja tem preenchimento ou nenhum padrao corresponde.')
      return
    }

    setDrafts((current) => ({ ...current, ...filled }))
    setMessage(`Preenchido com padrao para ${Object.keys(filled).length} jogo(s). Revise e salve.`)
  }

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

      {predictionsOpen && hasDefaults && (
        <div style={{ width: 'min(74.5rem, 100%)', margin: '0.75rem auto', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="ghost-button"
            style={{ border: '1px solid #38d20f', color: '#38d20f', background: '#fff', cursor: 'pointer', font: 'inherit', fontWeight: 900 }}
            onClick={fillWithDefaults}
            type="button"
          >
            Preencher com padrao
          </button>
        </div>
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
                  const disabled = !predictionsOpen || savingMatchId === match.id
                  const home = getTeamPresentation(match.home_team)
                  const away = getTeamPresentation(match.away_team)

                  return (
                    <article className="game-card" key={match.id}>
                      <div className="game-card-info">
                        <time>{formatMatchTime(match.starts_at)}</time>
                        <span>{match.counts_for_pool ? 'Pontua' : 'Nao pontua'}</span>
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
                          {savingMatchId === match.id ? 'Salvando' : prediction ? 'Atualizar' : 'Salvar'}
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
