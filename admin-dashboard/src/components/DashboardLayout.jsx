import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Brand from './Brand.jsx'
import Icon from './Icon.jsx'
import { createSampleRecords, sections } from '../data/sections.js'

export default function DashboardLayout({ user, onSignOut }) {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 960px)').matches)
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia('(max-width: 960px)').matches)
  const [records, setRecords] = useState(createSampleRecords)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const menuButton = useRef(null)
  const closeButton = useRef(null)
  const { pathname } = useLocation()
  const currentSection = sections.find((section) => pathname === `/dashboard/${section.id}`)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 960px)')
    const change = () => { setCompact(query.matches); setSidebarOpen(!query.matches) }
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (!compact || !sidebarOpen) return
    closeButton.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        requestAnimationFrame(() => menuButton.current?.focus())
      }
    }
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.body.style.overflow = previousOverflow
    }
  }, [compact, sidebarOpen])

  function closeSidebar() {
    setSidebarOpen(false)
    requestAnimationFrame(() => menuButton.current?.focus())
  }
  async function signOut() {
    setSigningOut(true)
    setError('')
    try { await onSignOut() }
    catch (requestError) { setError(requestError.message || 'Unable to sign out. Please try again.') }
    finally { setSigningOut(false) }
  }

  return (
    <div className={`dashboard${sidebarOpen ? ' dashboard--sidebar-open' : ''}`}>
      {compact && sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" tabIndex={-1} onClick={closeSidebar} />}
      {sidebarOpen && <aside className="sidebar" id="workspace-navigation" aria-label="Workspace navigation">
        <div className="sidebar__brand"><Brand light /><button className="icon-button sidebar__close" ref={closeButton} aria-label="Close navigation" onClick={closeSidebar}><Icon name="close" size={18} /></button></div>
        <nav>
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} onClick={() => { if (compact) closeSidebar() }}><Icon name="dashboard" />Overview</NavLink>
          {[...new Set(sections.map((section) => section.group))].map((group) => <div className="nav-group" key={group}>
            <span className="nav-group__label">{group}</span>
            {sections.filter((section) => section.group === group).map((section) => <NavLink key={section.id} to={`/dashboard/${section.id}`} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} onClick={() => { if (compact) closeSidebar() }}><Icon name={section.icon} />{section.label}</NavLink>)}
          </div>)}
        </nav>
        <div className="sidebar__footer"><span className="sidebar__avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.preview ? 'Preview workspace' : 'Super-admin'}</small></div><button className="icon-button" aria-label="Sign out" title="Sign out" disabled={signingOut} onClick={signOut}><Icon name="logout" size={19} /></button></div>
      </aside>}
      <div className="dashboard__body" inert={compact && sidebarOpen}>
        <header className="topbar">
          <div className="topbar__path"><button ref={menuButton} className="icon-button" aria-label={sidebarOpen ? 'Hide navigation' : 'Open navigation'} aria-controls="workspace-navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((value) => !value)}><Icon name="menu" /></button><span>Workspace</span><span className="topbar__separator">/</span><strong>{currentSection?.label || 'Overview'}</strong></div>
          <span className="topbar__status"><span />{user.preview ? 'Preview mode' : 'Super-admin workspace'}</span>
        </header>
        <main className="workspace" id="main-content">
          <div className="preview-notice"><Icon name="edit" size={15} /><span>Content preview <span className="preview-notice__detail">— sample content and edits stay in this tab until you reload.</span></span></div>
          {error && <p className="notice notice--error" role="alert">{error}</p>}
          <Outlet context={{ records, setRecords }} />
        </main>
      </div>
    </div>
  )
}
