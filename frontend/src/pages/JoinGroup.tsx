import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

type PublicGroup = {
  id: number
  name: string
  member_count: number
}

export function JoinGroup() {
  const { code } = useParams<{ code: string }>()
  const { user, session } = useAuth()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'invalid' | 'duplicate' | 'joined' | 'error'>('loading')
  const [groupName, setGroupName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [publicGroups, setPublicGroups] = useState<PublicGroup[]>([])
  const [loadingPublic, setLoadingPublic] = useState(true)

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!user || !code) return
    const currentUser = user
    const currentCode = code

    let active = true

    async function join() {
      const { data: group, error: lookupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('code', currentCode.toUpperCase())
        .maybeSingle()

      if (!active) return

      if (lookupError || !group) {
        setStatus('invalid')
        return
      }

      setGroupName(group.name)

      const { error: insertError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: currentUser.id })


      if (!active) return

      if (insertError) {
        if (insertError.code === '23505') {
          setStatus('duplicate')
        } else {
          setStatus('error')
          setErrorMessage(insertError.message)
        }
        return
      }

      setStatus('joined')
    }

    join()

    return () => { active = false }
  }, [user, code])

  useEffect(() => {
    if (!user || code) return
    let active = true

    async function load() {
      setLoadingPublic(true)

      const { data: groups } = await supabase
        .from('groups')
        .select('id, name')
        .eq('is_public', true)

      if (!active) return

      if (!groups || groups.length === 0) {
        setPublicGroups([])
        setLoadingPublic(false)
        return
      }

      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user!.id)

      const userGroupIds = new Set((memberships ?? []).map(m => m.group_id))

      const { data: counts } = await supabase
        .from('group_members')
        .select('group_id')

      const countMap: Record<number, number> = {}
      if (counts) {
        counts.forEach(m => {
          countMap[m.group_id] = (countMap[m.group_id] || 0) + 1
        })
      }

      if (!active) return

      setPublicGroups(
        groups
          .filter(g => !userGroupIds.has(g.id))
          .map(g => ({
            id: g.id,
            name: g.name,
            member_count: countMap[g.id] ?? 0,
          }))
      )
      setLoadingPublic(false)
    }

    load()
    return () => { active = false }
  }, [user, code])

  async function handleJoinPublic(groupId: number) {
    if (!user) return

    const { error: insertError } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id })

    if (insertError) {
      if (insertError.code === '23505') {
        setJoinError('Voce ja esta neste grupo.')
      } else {
        setJoinError(insertError.message)
      }
      return
    }

    navigate(`/grupos/${groupId}`)
  }

  async function handleJoinByCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setJoining(true)
    setJoinError('')

    const { data: group, error: lookupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('code', joinCode.toUpperCase())
      .maybeSingle()

    if (lookupError || !group) {
      setJoinError('Codigo invalido. Verifique e tente novamente.')
      setJoining(false)
      return
    }

    const { error: insertError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id })

    if (insertError) {
      if (insertError.code === '23505') {
        setJoinError('Voce ja faz parte deste grupo.')
      } else {
        setJoinError(insertError.message)
      }
      setJoining(false)
      return
    }

    setJoining(false)
    navigate(`/grupos/${group.id}`)
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (code) {
    return (
      <AppShell>
        <article className="content-card" style={{ textAlign: 'center', padding: '2rem' }}>
          {status === 'loading' && <p className="soft-text">Entrando no grupo...</p>}

          {status === 'invalid' && (
            <>
              <h2>Codigo invalido</h2>
              <p className="muted">Nao encontramos nenhum grupo com este codigo.</p>
              <Link className="primary-link" to="/grupos" style={{ textDecoration: 'none' }}>
                Ir para grupos
              </Link>
            </>
          )}

          {status === 'duplicate' && (
            <>
              <h2>Voce ja esta neste grupo</h2>
              <p className="muted">{groupName}</p>
              <Link className="primary-link" to="/jogos" style={{ textDecoration: 'none' }}>
                Ir para palpites
              </Link>
            </>
          )}

          {status === 'joined' && (
            <>
              <h2>Bem-vindo ao grupo!</h2>
              <p className="muted">Voce entrou em <strong>{groupName}</strong></p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                <Link className="primary-link" to="/jogos" style={{ textDecoration: 'none' }}>
                  Preencher palpites
                </Link>
                <Link className="hero-cta" to="/grupos" style={{ textDecoration: 'none' }}>
                  Ver grupos
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <h2>Erro ao entrar no grupo</h2>
              <p className="muted">{errorMessage || 'Tente novamente ou use o codigo manualmente.'}</p>
              <Link className="primary-link" to="/grupos" style={{ textDecoration: 'none' }}>
                Ir para grupos
              </Link>
            </>
          )}
        </article>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Entrar em grupo</h1>
          <p>Encontre grupos publicos ou use um codigo privado.</p>
        </div>
      </header>

      {joinError && <div className="dashboard-alert">{joinError}</div>}

      <section className="home-matches">
        <h2>Grupos publicos</h2>
        {loadingPublic && <p className="muted">Carregando grupos...</p>}
        {!loadingPublic && publicGroups.length === 0 && (
          <p className="muted">Nenhum grupo publico disponivel no momento.</p>
        )}
        {publicGroups.map((g) => (
          <div className="home-match-row" key={g.id} style={{ cursor: 'pointer' }} onClick={() => handleJoinPublic(g.id)}>
            <strong style={{ flex: 1, fontSize: '1.05rem' }}>{g.name}</strong>
            <span style={{ color: '#6b7280' }}>{g.member_count} membro{g.member_count !== 1 ? 's' : ''}</span>
            <button
              className="hero-cta"
              style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem', padding: '0.4rem 1rem' }}
              type="button"
            >
              Entrar
            </button>
          </div>
        ))}
      </section>

      <section className="home-matches" style={{ marginTop: 0 }}>
        <h2>Grupo privado</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>Digite o codigo de 8 caracteres para entrar.</p>
        <form className="profile-form" onSubmit={handleJoinByCode} style={{ maxWidth: '24rem' }}>
          <label>
            Codigo do grupo
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="EX: ABC12345"
              minLength={8}
              maxLength={8}
              required
              style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800 }}
            />
          </label>
          <button type="submit" disabled={joining}>
            {joining ? 'Entrando...' : 'Entrar no grupo'}
          </button>
        </form>
      </section>
    </AppShell>
  )
}
