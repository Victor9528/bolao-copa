import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

type Group = {
  id: number
  name: string
  code: string
  owner_id: string
  created_at: string
}

type Member = {
  user_id: string
  display_name: string
  joined_at: string
}

type RankingRow = {
  rank_position: number
  user_id: string
  display_name: string
  total_points: number
  predictions_count: number
}

export function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, session } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [ranking, setRanking] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [leftGroup, setLeftGroup] = useState(false)

  useEffect(() => {
    if (!user || !id) return

    let active = true

    const groupId = Number(id)
    if (!Number.isFinite(groupId)) return
    const currentUser = user

    async function load() {
      setLoading(true)

      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (!active) return
      if (!groupData) {
        setLoading(false)
        return
      }

      setGroup(groupData as Group)
      setIsMember(groupData.owner_id === currentUser.id || false)

      const { data: memberData } = await supabase
        .from('group_members')
        .select('user_id, joined_at')
        .eq('group_id', groupId)

      if (!active) return

      if (memberData) {
        const memberUserIds = memberData.map(m => m.user_id)
        setIsMember(memberUserIds.includes(currentUser.id))

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', memberUserIds)

        if (!active) return

        const profileMap: Record<string, string> = {}
        if (profiles) {
          profiles.forEach(p => {
            profileMap[p.id] = p.display_name
          })
        }

        setMembers(
          memberData.map(m => ({
            user_id: m.user_id,
            display_name: profileMap[m.user_id] || 'Desconhecido',
            joined_at: m.joined_at,
          }))
        )
      }

      const { data: rankingData } = await supabase
        .rpc('group_ranking', { target_group_id: groupId })

      if (!active) return

      if (rankingData) {
        setRanking(rankingData as RankingRow[])
      }

      setLoading(false)
    }

    load()

    return () => { active = false }
  }, [user, id])

  async function handleLeave() {
    if (!user || !group) return

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', user.id)

    if (!error) {
      setLeftGroup(true)
    }
  }

  if (leftGroup) {
    return (
      <AppShell>
        <article className="content-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Voce saiu do grupo</h2>
          <Link className="primary-link" to="/grupos" style={{ textDecoration: 'none' }}>
            Voltar para grupos
          </Link>
        </article>
      </AppShell>
    )
  }

  if (!loading && !group) {
    return (
      <AppShell>
        <article className="content-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Grupo nao encontrado</h2>
          <Link className="primary-link" to="/grupos" style={{ textDecoration: 'none' }}>
            Voltar para grupos
          </Link>
        </article>
      </AppShell>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const joinUrl = group ? `${window.location.origin}/grupos/entrar/${group.code}` : ''

  return (
    <AppShell>
      {loading && (
        <section className="content-card">
          <p className="soft-text">Carregando grupo...</p>
        </section>
      )}

      {!loading && group && (
        <>
          <header className="games-header">
            <div>
              <h1>{group.name}</h1>
              {group.owner_id === user?.id && (
                <p className="muted" style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                  Codigo: {group.code}
                </p>
              )}
            </div>
            {isMember && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link className="hero-cta" to="/jogos" style={{ textDecoration: 'none' }}>
                  Preencher palpites
                </Link>
                <button
                  className="ghost-button"
                  style={{ cursor: 'pointer', font: 'inherit' }}
                  onClick={handleLeave}
                  type="button"
                >
                  Sair do grupo
                </button>
              </div>
            )}
          </header>

          <div className="feature-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <article className="content-card" style={{
              width: 'auto', margin: 0, padding: '1.25rem',
            }}>
              <h2>Compartilhar</h2>
              <p className="muted">Envie o QR code ou o link para os amigos entrarem no grupo.</p>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.75rem', padding: '1rem 0',
              }}>
                <QRCodeSVG value={joinUrl} size={160} />
                <p style={{ fontSize: '0.85rem', color: '#6b7280', wordBreak: 'break-all', textAlign: 'center', margin: 0 }}>
                  {joinUrl}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="hero-cta"
                    style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' }}
                    onClick={() => navigator.clipboard.writeText(joinUrl)}
                    type="button"
                  >
                    Copiar link
                  </button>
                  {group.owner_id === user?.id && (
                    <button
                      className="hero-cta"
                      style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' }}
                      onClick={() => navigator.clipboard.writeText(group.code)}
                      type="button"
                    >
                      Copiar codigo
                    </button>
                  )}
                </div>
              </div>
            </article>

            <article className="content-card" style={{
              width: 'auto', margin: 0, padding: '1.25rem',
            }}>
              <h2>Membros ({members.length})</h2>
              {members.length === 0 && <p className="soft-text">Nenhum membro ainda.</p>}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                {members.map((m) => (
                  <li key={m.user_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    background: m.user_id === group.owner_id ? '#f0fdf4' : '#f9fafb',
                  }}>
                    <span>
                      <strong>{m.display_name}</strong>
                      {m.user_id === group.owner_id && (
                        <span style={{ color: '#38d20f', fontWeight: 800, marginLeft: '0.5rem' }}>Dono</span>
                      )}
                    </span>
                    {m.user_id === user?.id && <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Voce</span>}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <section className="content-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ margin: 0 }}>Ranking do grupo</h2>
              <Link className="card-link" to="/ranking" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                Ver ranking global
              </Link>
            </div>

            {ranking.length === 0 && (
              <p className="soft-text" style={{ marginTop: '1rem' }}>
                Nenhum participante com pontuacao ainda. Os pontos aparecerao apos os jogos serem atualizados.
              </p>
            )}

            {ranking.length > 0 && (
              <ol className="ranking-table" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
                {ranking.map((row) => (
                  <li key={row.user_id} className={row.user_id === user?.id ? 'current-user' : ''} style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'center',
                    padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb',
                  }}>
                    <span className="rank-number" style={{
                      display: 'grid', width: '2rem', height: '2rem', placeItems: 'center',
                      borderRadius: '999px', background: '#38d20f', color: '#fff', fontWeight: 900,
                    }}>
                      {row.rank_position}
                    </span>
                    <strong>{row.display_name}</strong>
                    <em style={{ color: '#459d19', fontStyle: 'normal', fontWeight: 900 }}>
                      {row.total_points} pts
                    </em>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </AppShell>
  )
}
