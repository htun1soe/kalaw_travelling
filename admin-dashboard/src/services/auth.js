import { apiRequest } from './api.js'

const mode = import.meta.env.VITE_AUTH_MODE || 'api'
if (!['preview', 'api'].includes(mode)) throw new Error('VITE_AUTH_MODE must be preview or api.')
export const isPreviewMode = import.meta.env.DEV && mode === 'preview'

function userFromResponse(data) {
  if (!data || typeof data.username !== 'string' || !data.username.trim()) {
    throw new Error('The sign-in response must include a username.')
  }
  return { name: data.username }
}

export const auth = {
  async currentUser() {
    if (isPreviewMode) return null
    return userFromResponse(await apiRequest('/api/auth/me'))
  },
  async signIn(username, password) {
    if (isPreviewMode) throw new Error('Use Preview dashboard to explore this frontend.')
    return userFromResponse(await apiRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }))
  },
  async signOut() {
    if (!isPreviewMode) await apiRequest('/api/auth/logout', { method: 'POST' })
  },
}
