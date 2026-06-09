import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

export function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [defaultsCount, setDefaultsCount] = useState(0)
  const [savingDefaults, setSavingDefaults] = useState(false)
  const [defaultsMessage, setDefaultsMessage] = useState('')

  useEffect(() => {
    if (!user) return

    let active = true
    const currentUser = user

    async function loadProfile() {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (!active) return

      if (profileError) {
        setError('Nao foi possivel carregar seu perfil.')
      } else {
        setDisplayName(data?.display_name || currentUser.email || '')
      }

      const { count } = await supabase
        .from('default_predictions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)

      if (!active) return
      setDefaultsCount(count ?? 0)
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [user])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setMessage('Perfil atualizado com sucesso.')
  }

  const saveCurrentAsDefaults = useCallback(async () => {
    if (!user) return

    setSavingDefaults(true)
    setDefaultsMessage('')

    const { data: predictions } = await supabase
      .from('predictions')
      .select('match_id, home_score, away_score')
      .eq('user_id', user.id)

    if (!predictions || predictions.length === 0) {
      setDefaultsMessage('Nenhum palpite salvo para usar como padrao.')
      setSavingDefaults(false)
      return
    }

    await supabase
      .from('default_predictions')
      .delete()
      .eq('user_id', user.id)

    const { error: insertError } = await supabase
      .from('default_predictions')
      .insert(predictions.map(p => ({
        user_id: user.id,
        match_id: p.match_id,
        home_score: p.home_score,
        away_score: p.away_score,
      })))

    setSavingDefaults(false)

    if (insertError) {
      setDefaultsMessage('Erro ao salvar padrao: ' + insertError.message)
      return
    }

    setDefaultsCount(predictions.length)
    setDefaultsMessage(`Palpites padrao salvos (${predictions.length} jogos).`)
  }, [user])

  return (
    <AppShell>
      <header className="games-header">
        <div>
          <h1>Perfil</h1>
          <p>Dados da sua conta no bolao</p>
        </div>
        <strong>{user?.email}</strong>
      </header>

      <section className="content-card profile-card">
        {loading && <p className="soft-text">Carregando perfil...</p>}

        {!loading && (
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              Nome no ranking
              <input
                minLength={2}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                type="text"
                value={displayName}
              />
            </label>

            {message && <div className="inline-success">{message}</div>}
            {error && <div className="inline-error">{error}</div>}

            <button disabled={saving} type="submit">
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </form>
        )}
      </section>

      <section className="content-card profile-card" style={{ marginTop: '1rem' }}>
        <h2>Palpites padrao</h2>
        <p className="muted">
          {defaultsCount > 0
            ? `Voce tem ${defaultsCount} palpites padrao salvos.`
            : 'Nenhum palpite padrao salvo ainda.'}
        </p>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Use "Salvar palpites atuais como padrao" para copiar seus palpites ja salvos como template.
          Depois, ao entrar em um grupo ou acessar a pagina de jogos, clique em "Preencher com padrao".
        </p>

        {defaultsMessage && <div className={defaultsMessage.includes('Erro') ? 'inline-error' : 'inline-success'}>{defaultsMessage}</div>}

        <button
          disabled={savingDefaults}
          onClick={saveCurrentAsDefaults}
          type="button"
          style={{
            marginTop: '0.75rem',
            border: 0, borderRadius: '999px', padding: '0.8rem 1rem',
            background: '#38d20f', color: '#fff', cursor: 'pointer',
            font: 'inherit', fontWeight: 900,
          }}
        >
          {savingDefaults ? 'Salvando...' : 'Salvar palpites atuais como padrao'}
        </button>
      </section>
    </AppShell>
  )
}
