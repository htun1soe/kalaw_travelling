import { useState } from 'react'
import Brand from '../components/Brand.jsx'
import Icon from '../components/Icon.jsx'
import hills from '../assets/shan-hills.webp'
import { isPreviewMode } from '../services/auth.js'

const photoSource = 'https://commons.wikimedia.org/wiki/File:Pangetkon,_Shan_Hills,_Myanmar,_Landscape_with_a_tree_amidst_green_hills,_remote_location_in_rural_Myanmar_near_Kalaw_village.jpg'

function signInError(error) {
  switch (error.status) {
    case 401: return 'Check your username and password, then try again.'
    case 419: return 'Your sign-in session expired. Please try again.'
    case 422: return 'Check your credentials. Usernames can contain letters, numbers, hyphens, and underscores.'
    case 429: return 'Too many sign-in attempts. Wait a minute, then try again.'
    default: return 'Unable to reach the sign-in service. Please try again shortly.'
  }
}

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
    try {
      await onSignIn(username.trim(), password)
    } catch (requestError) {
      setError(signInError(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login">
      <section className="login__panel" aria-labelledby="login-title">
        <div className="login__form-wrap">
          <header className="login__heading">
            <p className="login__role"><Icon name="lock" size={14} /> Super-admin workspace</p>
            <h1 id="login-title">{isPreviewMode ? 'Preview access' : 'Sign in'}</h1>
            <p className="login__intro">{isPreviewMode
              ? 'Explore the dashboard with a preview session.'
              : 'Enter your credentials to open the Kalaw Travelling dashboard.'}</p>
          </header>
          {notice && <p className="notice" role="status">{notice}</p>}
          {isPreviewMode ? (
            <button className="button button--primary login__submit" type="button" onClick={onPreview}>
              Preview dashboard<Icon name="arrow" size={18} />
            </button>
          ) : (
            <form className="login__form" onSubmit={submit} aria-busy={submitting}>
              <div className="login__field">
                <label htmlFor="username">Username</label>
                <input id="username" name="username" autoComplete="username" autoCapitalize="none"
                  spellCheck={false} maxLength={64} required value={username} disabled={submitting}
                  onChange={(event) => { setUsername(event.target.value); setError('') }} />
              </div>
              <div className="login__field">
                <label htmlFor="password">Password</label>
                <div className="login__password">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required value={password} disabled={submitting}
                    onChange={(event) => { setPassword(event.target.value); setError('') }} />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-controls="password" onClick={() => setShowPassword((visible) => !visible)}>
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
                  </button>
                </div>
              </div>
              {error && <p className="notice notice--error" role="alert">{error}</p>}
              <button className="button button--primary login__submit" type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}<Icon name="arrow" size={18} />
              </button>
            </form>
          )}
        </div>
      </section>
      <figure className="login__scene">
        <img className="login__photo" src={hills} alt="" width="1664" height="935" />
        <Brand light />
        <figcaption className="login__caption">
          <span className="login__place"><Icon name="pin" size={14} />Pangetkon, Myanmar</span>
          <span className="login__photo-title">Shan Hills</span>
          <span className="login__credit">
            <a href={photoSource} rel="noreferrer" target="_blank">© Vyacheslav Argenberg</a>
            <span aria-hidden="true"> · </span>
            <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer" target="_blank">CC BY 4.0</a>
          </span>
        </figcaption>
      </figure>
    </main>
  )
}
