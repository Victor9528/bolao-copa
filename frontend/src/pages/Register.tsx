import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Register() {
  const { session } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Cadastro criado. Verifique seu email se a confirmacao estiver ativa no Supabase.')
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Novo participante</p>
        <h1>Crie sua conta no Bolao</h1>
        <p className="muted">Use email e senha para entrar na plataforma do bolao.</p>

        {!isSupabaseConfigured && (
          <div className="notice">
            Preencha frontend/.env com as chaves do Supabase para ativar cadastro real.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome no ranking
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Seu nome ou apelido"
              minLength={2}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo de 6 caracteres"
              minLength={6}
              required
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  )
}
