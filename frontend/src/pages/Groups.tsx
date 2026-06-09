import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function Groups() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null)

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!user) return

    let active = true

    async function loadGroups() {
      setLoading(true)
      setError('')

      const { data: ownedData } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false })

      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user!.id)

      const memberGroupIds = [...new Set([
        ...(ownedData ?? []).map(g => g.id),
        ...(memberData ?? []).map(m => m.group_id),
      ])]

      if (!active) return

      if (memberGroupIds.length === 0) {
        setGroups([])
        setMemberCounts({})
        setLoading(false)
        return
      }

      const { data: allGroups } = await supabase
        .from('groups')
        .select('*')
        .in('id', memberGroupIds)
        .order('created_at', { ascending: false })

      if (!active) return

      if (allGroups) {
        setGroups(allGroups)

        const { data: counts } = await supabase
          .from('group_members')
          .select('group_id')
          .in('group_id', allGroups.map(g => g.id))

        const countMap: Record<number, number> = {}
        if (counts) {
          counts.forEach(m => {
            countMap[m.group_id] = (countMap[m.group_id] || 0) + 1
          })
        }
        setMemberCounts(countMap)
      }

      setLoading(false)
    }

    loadGroups()

    return () => { active = false }
  }, [user])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setCreating(true)
    setError('')

    const code = generateCode()

    const { data, error: createError } = await supabase
      .from('groups')
      .insert({ name: createName, code, owner_id: user.id })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setCreating(false)
      return
    }

    const newGroup = data as Group
    setCreatedGroup(newGroup)
    setCreateName('')

    await supabase.from('group_members').insert({
      group_id: newGroup.id,
      user_id: user.id,
    })

    setCreating(false)
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setJoining(true)
    setJoinError('')

    const { data: group, error: lookupError } = await supabase
      .from('groups')
      .select('id, name, code')
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

  const joinUrl = user ? `${window.location.origin}/grupos/entrar/${createdGroup?.code}` : ''

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Grupos</h1>
          <p>Crie ou entre em grupos para competir com amigos</p>
        </div>
      </header>

      {error && <div className="dashboard-alert">{error}</div>}

      {createdGroup ? (
        <article className="content-card">
          <h2>Grupo criado com sucesso!</h2>
          <p style={{ color: '#6b7280' }}>Compartilhe o codigo ou o link abaixo para convidar amigos.</p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem 0',
          }}>
            <p style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.3em', color: '#38d20f', margin: 0 }}>
              {createdGroup.code}
            </p>
            <QRCodeSVG value={joinUrl} size={180} />
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <button
                className="hero-cta"
                style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' }}
                onClick={() => navigator.clipboard.writeText(joinUrl)}
                type="button"
              >
                Copiar link
              </button>
              <button
                className="hero-cta"
                style={{ border: 0, cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' }}
                onClick={() => navigator.clipboard.writeText(createdGroup.code)}
                type="button"
              >
                Copiar codigo
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link className="primary-link" to={`/grupos/${createdGroup.id}`} style={{ textDecoration: 'none' }}>
              Ver grupo
            </Link>
            <Link className="hero-cta" to="/jogos" style={{ textDecoration: 'none' }}>
              Preencher palpites
            </Link>
          </div>
        </article>
      ) : (
        <>
          <div className="feature-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <article className="content-card" style={{
              width: 'auto', margin: 0, padding: '1.25rem',
              borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#fff',
            }}>
              <h2>Criar grupo</h2>
              <p>Crie um grupo e convide amigos para participar.</p>
              <form className="profile-form" onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
                <label>
                  Nome do grupo
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Ex: Amigos do trabalho"
                    minLength={2}
                    required
                  />
                </label>
                <button type="submit" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar grupo'}
                </button>
              </form>
            </article>

            <article className="content-card" style={{
              width: 'auto', margin: 0, padding: '1.25rem',
              borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#fff',
            }}>
              <h2>Entrar em grupo</h2>
              <p>Digite o codigo de 8 caracteres do grupo.</p>
              <form className="profile-form" onSubmit={handleJoin} style={{ marginTop: '1rem' }}>
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
                {joinError && <div className="inline-error">{joinError}</div>}
                <button type="submit" disabled={joining}>
                  {joining ? 'Entrando...' : 'Entrar no grupo'}
                </button>
              </form>
            </article>
          </div>

          <section className="content-card" style={{ marginTop: '1.5rem' }}>
            <h2>Meus grupos</h2>
            {loading && <p className="soft-text">Carregando grupos...</p>}
            {!loading && groups.length === 0 && (
              <p className="soft-text">Voce ainda nao participa de nenhum grupo. Crie ou entre em um grupo acima.</p>
            )}
            {!loading && groups.length > 0 && (
              <div className="rules-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    to={`/grupos/${g.id}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1rem', borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb', background: '#f9fafb',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{g.name}</strong>
                      <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontFamily: 'monospace' }}>
                        {g.owner_id === user?.id && <span style={{ color: '#38d20f', fontWeight: 800 }}>Dono · </span>}
                        Codigo: {g.code}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>{memberCounts[g.id] ?? '-'}</strong>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>membros</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  )
}
