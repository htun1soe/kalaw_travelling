import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { auth, isPreviewMode } from './services/auth.js'
import { SESSION_EXPIRED } from './services/api.js'
import HomeGallery from './pages/HomeGallery.jsx'
import HomeStories from './pages/HomeStories.jsx'
import Housing from './pages/Housing.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import Trending from './pages/Trending.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import Brand from './components/Brand.jsx'

export default function App() {
  const [session, setSession] = useState({ status: isPreviewMode ? 'anonymous' : 'loading', user: null })
  const [attempt, setAttempt] = useState(0)
  const [notice, setNotice] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (isPreviewMode) return
    let active = true
    auth.currentUser().then(
      (user) => { if (active) setSession({ status: 'ready', user }) },
      (error) => {
        if (!active) return
        if (error.status === 403) setNotice('Sign in with a super-admin account.')
        const needsSignIn = error.status === 401 || error.status === 403
        setSession({ status: needsSignIn ? 'anonymous' : 'error', user: null })
      },
    )
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    const expire = () => {
      setNotice('Your session has ended. Please sign in again.')
      setSession({ status: 'anonymous', user: null })
    }
    window.addEventListener(SESSION_EXPIRED, expire)
    return () => window.removeEventListener(SESSION_EXPIRED, expire)
  }, [])

  async function signIn(username, password) {
    const user = await auth.signIn(username, password)
    setNotice('')
    setSession({ status: 'ready', user })
  }

  async function signOut() {
    await auth.signOut()
    setNotice('You have signed out.')
    setSession({ status: 'anonymous', user: null })
  }

  if (session.status === 'loading' || session.status === 'error') return (
    <main className="session-screen">
      <Brand />
      <h1>{session.status === 'loading' ? 'Opening your workspace…' : 'Unable to reach your workspace'}</h1>
      <p role="status">{session.status === 'loading' ? 'Checking your session.' : 'Check your connection and try again.'}</p>
      {session.status === 'error' && <button className="button button--primary" onClick={() => {
        setSession({ status: 'loading', user: null })
        setAttempt((value) => value + 1)
      }}>Try again</button>}
    </main>
  )

  const from = location.state?.from
  const destination = typeof from === 'string' && /^\/dashboard(?:\/|$)/.test(from) ? from : '/dashboard'
  return (
    <Routes>
      <Route path="/login" element={session.user ? <Navigate to={destination} replace /> : (
        <LoginPage onSignIn={signIn} notice={notice} onPreview={() => {
          setNotice('')
          setSession({ status: 'ready', user: { name: 'Preview editor', preview: true } })
        }} />
      )} />
      <Route path="/dashboard" element={session.user
        ? <DashboardLayout user={session.user} onSignOut={signOut} />
        : <Navigate to="/login" state={{ from: location.pathname }} replace />}>
        <Route index element={<OverviewPage />} />
        <Route path="home-gallery" element={<HomeGallery />} />
        <Route path="home-stories" element={<HomeStories />} />
        <Route path="trending" element={<Trending />} />
        <Route path="housing" element={<Housing />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to={session.user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
