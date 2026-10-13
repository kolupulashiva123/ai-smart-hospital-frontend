import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const u = await login(username, password)
      navigate(u.role === 'ADMIN' ? '/admin' : '/doctor')
    } catch (err) {
      setError(errMsg(err))
    } finally { setLoading(false) }
  }

  return (
    <div className="login-box card">
      <h1>Staff Login</h1>
      <p className="muted">For doctors and administrators. Patients do not need to log in.</p>
      <form onSubmit={submit}>
        <label>Username</label>
        <input required value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        <label>Password</label>
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      </form>
      <div className="demo-creds">
        <b>Demo accounts</b>
        <div>Admin: <code>admin</code> / <code>admin123</code></div>
        <div>Doctor: <code>dr.sharma</code> / <code>doctor123</code></div>
      </div>
    </div>
  )
}
