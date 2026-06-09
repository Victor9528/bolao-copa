import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import { formatMatchTime, getTeamPresentation, groupMatchesByDay } from '../lib/matches'
import type { Match } from '../lib/matches'

export function Dashboard() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let active = true
    const currentUser = user

    async function load() {
      setLoading(true)

      const [profileResult, matchesResult] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', currentUser.id).maybeSingle(),
        supabase
          .from('matches')
          .select('id, home_team, away_team, home_score, away_score, starts_at, status, counts_for_pool')
          .neq('status', 'finished')
          .order('starts_at', { ascending: true }),
      ])

      if (!active) return

      if (!profileResult.error) {
        setDisplayName(profileResult.data?.display_name || currentUser.email || 'Participante')
      }

      if (!matchesResult.error) {
        setMatches((matchesResult.data ?? []) as Match[])
      }

      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [user])

  const grouped = groupMatchesByDay(matches)

  return (
    <AppShell>
      <header className="dashboard-header">
        <h1>{displayName}</h1>
      </header>

      {loading && matches.length === 0 && (
        <section className="games-empty">Carregando...</section>
      )}

      {!loading && (
        <>
          <section className="home-cards">
            <Link to="/grupos" className="home-card">
              <span className="home-card-icon">+</span>
              <h2>Criar grupo</h2>
              <p>Crie um grupo e convide amigos para competir.</p>
            </Link>
            <Link to="/grupos/entrar" className="home-card">
              <span className="home-card-icon">&rarr;</span>
              <h2>Entrar em grupo</h2>
              <p>Encontre grupos publicos ou use um codigo privado.</p>
            </Link>
            <Link to="/regulamento" className="home-card">
              <span className="home-card-icon">i</span>
              <h2>Ver regras</h2>
              <p>Confira como funciona a pontuacao.</p>
            </Link>
          </section>

          <section className="home-matches">
            <h2>Proximos jogos</h2>
            {matches.length === 0 && (
              <p className="muted">Nenhum jogo futuro encontrado.</p>
            )}
            {grouped.map((group) => (
              <div className="day-group" key={group.day}>
                <h3>{group.day}</h3>
                <div className="home-matches-list">
                  {group.matches.map((match) => {
                    const home = getTeamPresentation(match.home_team)
                    const away = getTeamPresentation(match.away_team)
                    return (
                      <div className="home-match-row" key={match.id}>
                        <time>{formatMatchTime(match.starts_at)}</time>
                        <div className="home-match-teams">
                          {home.flagCode && <img alt="" src={`https://flagcdn.com/w80/${home.flagCode}.png`} />}
                          <strong>{home.code}</strong>
                          <span>x</span>
                          <strong>{away.code}</strong>
                          {away.flagCode && <img alt="" src={`https://flagcdn.com/w80/${away.flagCode}.png`} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </AppShell>
  )
}
