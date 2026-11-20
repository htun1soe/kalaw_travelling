const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const SESSION_EXPIRED = 'admin:session-expired'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readResponse(response) {
  if (response.status === 204) return null
  const body = await response.text()
  if (!body) return null
  try { return JSON.parse(body) } catch { return { message: body } }
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      cache: 'no-store',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const csrf = await readResponse(csrfResponse)
    if (!csrfResponse.ok || !csrf?.token) {
      if (csrfResponse.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED))
      throw new ApiError('Could not prepare a secure request. Please try again.', csrfResponse.status)
    }
    headers.set('X-CSRF-TOKEN', csrf.token)
  }
  const response = await fetch(`${baseUrl}${path}`, { cache: 'no-store', ...options, method, headers, credentials: 'include' })
  const data = await readResponse(response)
  if (!response.ok) {
    if (response.status === 401 && !['/api/auth/login', '/api/auth/me'].includes(path)) {
      window.dispatchEvent(new Event(SESSION_EXPIRED))
    }
    throw new ApiError(data?.message || data?.detail || 'The request could not be completed.', response.status)
  }
  return data
}
