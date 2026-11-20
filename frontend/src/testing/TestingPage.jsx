import { useEffect, useState } from 'react'

const apiEndpoint = '/api/testing'
const databaseEndpoint = '/api/testing/database'
const timeoutMs = 5000
const statusLabels = {
  pending: 'Checking the API…',
  passed: 'Check passed',
  failed: 'Check failed',
}
const databaseLabels = {
  pending: 'Checking the database…',
  connected: 'Connected',
  unavailable: 'Database unavailable',
  timeout: 'Database check timed out',
  unknown: 'Unable to get a database result',
  skipped: 'Waiting for a successful API check',
}

function requestCheck(endpoint, signal) {
  return fetch(endpoint, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
}

async function checkApi(signal) {
  const startedAt = performance.now()
  let httpStatus = null
  let payload
  let error = ''

  try {
    const response = await requestCheck(apiEndpoint, signal)
    httpStatus = response.status

    if (!response.ok) throw new Error(`The server returned HTTP ${httpStatus}.`)
    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
    if (contentType !== 'application/json') {
      throw new Error('Expected JSON. Check that /api requests reach the Laravel server.')
    }

    payload = await response.json()
    if (payload?.status !== 'success' || typeof payload.message !== 'string' || typeof payload.version !== 'string') {
      throw new Error('Expected a success status, a message, and an API version.')
    }
  } catch (cause) {
    if (signal.aborted) {
      error = `The API did not respond within ${timeoutMs / 1000} seconds.`
    } else if (cause instanceof SyntaxError) {
      error = 'The response contains invalid JSON.'
    } else if (cause instanceof TypeError) {
      error = 'Could not reach the API. Check your connection and try again.'
    } else {
      error = cause.message
    }
  }

  return { httpStatus, payload, error, durationMs: Math.round(performance.now() - startedAt), checkedAt: new Date() }
}

async function checkDatabase(signal) {
  try {
    const response = await requestCheck(databaseEndpoint, signal)
    const data = await response.json()
    if (response.ok && data?.status === 'connected') return 'connected'
    if (response.status === 503 && data?.status === 'unavailable') return 'unavailable'
  } catch {
    if (signal.aborted) return 'timeout'
  }

  return 'unknown'
}

export default function TestingPage() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const [databaseStatus, setDatabaseStatus] = useState('pending')
  const status = result ? (result.error ? 'failed' : 'passed') : 'pending'

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let timeout

    async function runChecks() {
      timeout = setTimeout(() => controller.abort(), timeoutMs)
      const apiResult = await checkApi(controller.signal)
      clearTimeout(timeout)
      if (!active) return
      setResult(apiResult)

      if (apiResult.error) {
        setDatabaseStatus('skipped')
        return
      }

      timeout = setTimeout(() => controller.abort(), timeoutMs)
      const status = await checkDatabase(controller.signal)
      clearTimeout(timeout)
      if (active) setDatabaseStatus(status)
    }

    runChecks()

    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  function runAgain() {
    setResult(null)
    setDatabaseStatus('pending')
    setAttempt((previous) => previous + 1)
  }

  return (
    <main className="testing-shell">
      <a className="testing-home" href="/">← Back to Kalaw Traveling</a>
      <header className="testing-intro">
        <h1>API testing</h1>
        <p>Check whether Laravel responds and can reach its configured database.</p>
      </header>

      <section className="testing-panel" aria-labelledby="connection-heading">
        <div className="test-toolbar">
          <h2 id="connection-heading">Connection checks</h2>
          <button type="button" onClick={runAgain} disabled={databaseStatus === 'pending'}>
            Run test again
          </button>
        </div>

        <div className="test-checks" role="status">
          <div className="test-status" data-state={status}>
            <strong>Laravel API</strong>
            <p>{statusLabels[status]}</p>
            {result?.error && <p>{result.error}</p>}
            <code className="test-endpoint">GET {apiEndpoint}</code>
          </div>
          <div className="test-status" data-state={databaseStatus}>
            <strong>Database connection</strong>
            <p>{databaseLabels[databaseStatus]}</p>
            <code className="test-endpoint">GET {databaseEndpoint}</code>
          </div>
        </div>

        <dl className="test-metrics">
          <div>
            <dt>HTTP status</dt>
            <dd>{result ? result.httpStatus ?? 'No response' : '—'}</dd>
          </div>
          <div>
            <dt>API response time</dt>
            <dd>{result ? `${result.durationMs} ms` : '—'}</dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd>{result ? <time dateTime={result.checkedAt.toISOString()}>{result.checkedAt.toLocaleTimeString()}</time> : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="testing-panel" aria-labelledby="response-heading">
        <h2 id="response-heading">API JSON response</h2>
        {result?.payload === undefined ? (
          <p className="response-placeholder">{result ? 'No JSON response to display.' : 'Waiting for the API response…'}</p>
        ) : (
          <pre className="test-response"><code>{JSON.stringify(result.payload, null, 2)}</code></pre>
        )}
      </section>
    </main>
  )
}
