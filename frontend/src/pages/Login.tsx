import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const { session } = useAuth()
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Bolao da Copa EloGroup</p>
        <h1>Entre para registrar seus palpites</h1>
        <p className="muted">Acesse sua conta para acompanhar jogos, palpites e ranking.</p>

        {!isSupabaseConfigured && (
          <div className="notice">
            Preencha frontend/.env com as chaves do Supabase para ativar login real.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Sua senha"
              minLength={6}
              required
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Ainda nao tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </section>
    </main>
  )
}
