import { useEffect, useState, type FormEvent } from 'react'
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
    </AppShell>
  )
}
