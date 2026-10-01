import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import config from '../config'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const StarSvg = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="login-star" aria-hidden="true">
    <polygon
      points="18,2 20.9,12.4 31.2,9.5 24.5,18 31.2,26.5 20.9,23.6 18,34 15.1,23.6 4.8,26.5 11.5,18 4.8,9.5 15.1,12.4"
      stroke="currentColor" strokeWidth="0.75" fill="none" strokeLinejoin="round"
    />
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (DEMO) {
      await new Promise(r => setTimeout(r, 600))
      if (email.trim().toLowerCase() !== 'babi' || password !== 'babilonica') {
        setError('Credenciais não reconhecidas pelo Sanctum.')
        setLoading(false)
        return
      }
      sessionStorage.setItem('demo_admin', '1')
      navigate('/admin')
      return
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Credenciais não reconhecidas pelo Sanctum.')
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <StarSvg />
        <div className="login-logo">{config.store.name}</div>
        <div className="login-subtitle">Acesso ao Sanctum</div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">{DEMO ? 'Usuário' : 'Email'}</label>
            <input
              id="email"
              type={DEMO ? 'text' : 'email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={DEMO ? 'babi' : 'mestre@babilonica.com'}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Invocando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
