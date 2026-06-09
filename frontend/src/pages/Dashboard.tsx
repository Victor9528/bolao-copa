import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'
import { formatMatchTime, getTeamPresentation, groupMatchesByDay } from '../lib/matches'
import type { Match } from '../lib/matches'

type UserGroup = {
  id: number
  name: string
  is_public: boolean
  member_count: number
}

export function Dashboard() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
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

      const { data: ownedData } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', currentUser.id)

      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser.id)

      if (!active) return

      const memberGroupIds = [...new Set([
        ...(ownedData ?? []).map(g => g.id),
        ...(memberData ?? []).map(m => m.group_id),
      ])]

      if (memberGroupIds.length > 0) {
        const { data: allGroups } = await supabase
          .from('groups')
          .select('*')
          .in('id', memberGroupIds)

        if (!active) return

        if (allGroups) {
          const { data: counts } = await supabase
            .from('group_members')
            .select('group_id')

          const countMap: Record<number, number> = {}
          if (counts) {
            counts.forEach(m => {
              countMap[m.group_id] = (countMap[m.group_id] || 0) + 1
            })
          }

          setGroups(
            allGroups.map(g => ({
              id: g.id,
              name: g.name,
              is_public: g.is_public,
              member_count: countMap[g.id] ?? 0,
            }))
          )
        }
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
            <Link to="/ranking" className="home-card">
              <span className="home-card-icon">#</span>
              <h2>Ver ranking</h2>
              <p>Confira a pontuacao de todos os participantes.</p>
            </Link>
            <Link to="/regulamento" className="home-card">
              <span className="home-card-icon">i</span>
              <h2>Ver regras</h2>
              <p>Confira como funciona a pontuacao.</p>
            </Link>
          </section>

          {groups.length > 0 && (
            <section className="home-matches">
              <h2>Meus grupos</h2>
              <div className="home-matches-list">
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    to={`/grupos/${g.id}`}
                    className="home-match-row"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <strong style={{ flex: 1, fontSize: '1.05rem' }}>{g.name}</strong>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      {g.member_count} membro{g.member_count !== 1 ? 's' : ''}
                    </span>
                    <span style={{ color: '#38d20f', fontWeight: 700, fontSize: '0.8rem' }}>
                      {g.is_public ? 'Publico' : 'Privado'}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
