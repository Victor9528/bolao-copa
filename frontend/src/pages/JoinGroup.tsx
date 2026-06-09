import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

export function JoinGroup() {
  const { code } = useParams<{ code: string }>()
  const { user, session } = useAuth()
  const [status, setStatus] = useState<'loading' | 'invalid' | 'duplicate' | 'joined' | 'error'>('loading')
  const [groupName, setGroupName] = useState('')

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
        .select()

      if (!active) return

      if (insertError) {
        if (insertError.code === '23505') {
          setStatus('duplicate')
        } else {
          setStatus('error')
        }
        return
      }

      setStatus('joined')
    }

    join()

    return () => { active = true }
  }, [user, code])

  if (!session) {
    return <Navigate to="/login" replace />
  }

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
            <p className="muted">Tente novamente ou use o codigo manualmente.</p>
            <Link className="primary-link" to="/grupos" style={{ textDecoration: 'none' }}>
              Ir para grupos
            </Link>
          </>
        )}
      </article>
    </AppShell>
  )
}
