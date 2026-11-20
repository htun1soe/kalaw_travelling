import { useState } from 'react'
import Brand from '../components/Brand.jsx'
import Icon from '../components/Icon.jsx'
import { isPreviewMode } from '../services/auth.js'

export default function LoginPage({ onSignIn, onPreview, notice }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (submitting || isPreviewMode) return
    setSubmitting(true)
    setError('')
    try { await onSignIn(username.trim(), password) }
    catch (requestError) { setError(requestError.message || 'Unable to sign in. Please try again.') }
    finally { setSubmitting(false) }
  }

  return (
    <main className="login">
      <aside className="login__story">
        <Brand light />
        <div className="login__landscape" aria-hidden="true"><span /><span /><span /></div>
        <div className="login__story-copy">
          <p>Manage Kalaw Travelling content</p>
        </div>
      </aside>
      <section className="login__panel" aria-labelledby="login-title">
        <div className="login__form-wrap">
          <h1 id="login-title">Super-admin sign-in</h1>
          {notice && <p className="notice" role="status">{notice}</p>}
          <form onSubmit={submit} className="login__form">
            <label>Username<input name="username" autoComplete="username" autoCapitalize="none" placeholder="Enter your username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={submitting} maxLength={64} required /></label>
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {error && <p className="notice notice--error" role="alert">{error}</p>}
            <button className="button button--primary login__submit" type="submit" disabled={submitting || isPreviewMode}>{submitting ? 'Signing in…' : 'Sign in'}<Icon name="arrow" /></button>
          </form>
          {isPreviewMode && (
            <div className="login__preview">
              <p>Preview the dashboard with sample records. No account is needed.</p>
              <button className="button button--outline" type="button" onClick={onPreview}>
                Preview dashboard<Icon name="arrow" size={17} />
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
