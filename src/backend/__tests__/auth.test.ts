import http from 'http'
import { AddressInfo } from 'net'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Set before the server module loads, so config and session setup see these values.
process.env.SESSION_SECRET = 'test-session-secret'
process.env.GITHUB_CLIENT_ID = 'test-client-id'
process.env.REDIRECT_URI = 'https://localhost:3000/auth/github/callback'

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

let server: http.Server
let baseUrl: string

// Node's fetch does not enforce cookie flags, so the test can replay the session cookies.
const cookiesFrom = (res: Response) =>
  res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')

const startLogin = async (next?: string) => {
  const query = next === undefined ? '' : `?next=${encodeURIComponent(next)}`
  const res = await fetch(`${baseUrl}/login${query}`, { redirect: 'manual' })
  const location = new URL(res.headers.get('location') ?? '')
  return {
    cookies: cookiesFrom(res),
    state: location.searchParams.get('state') ?? '',
    status: res.status,
  }
}

const finishCallback = async (cookies: string, state: string) =>
  fetch(`${baseUrl}/auth/github/callback?code=abc&state=${state}`, {
    redirect: 'manual',
    headers: { cookie: cookies },
  })

describe('OAuth login return path', () => {
  beforeAll(async () => {
    const { app } = await import('../server.js')
    // express-session will not send a Secure cookie over plain HTTP, and production runs over HTTPS.
    // Report each test request as HTTPS so the session cookie round-trips.
    server = http.createServer((req, res) => {
      Object.defineProperty(req, 'secure', { value: true })
      app(req, res)
    }).listen(0)
    const { port } = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const stubGithubToken = () => {
    const { fetch: realFetch } = globalThis
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : input.toString()
      if (url === GITHUB_TOKEN_URL) {
        return Promise.resolve(Response.json({ access_token: 'gho_test' }))
      }
      return realFetch(input, init)
    })
  }

  it('login_NextPathGiven_CallbackRedirectsToThatPath', async () => {
    stubGithubToken()
    const login = await startLogin('/graphs/repo-commits-per-week?range=all')
    expect(login.status).toBe(302)

    const callback = await finishCallback(login.cookies, login.state)

    expect(callback.status).toBe(302)
    expect(callback.headers.get('location')).toBe('/graphs/repo-commits-per-week?range=all')
  })

  it('login_NoNextPath_CallbackRedirectsHome', async () => {
    stubGithubToken()
    const login = await startLogin()

    const callback = await finishCallback(login.cookies, login.state)

    expect(callback.headers.get('location')).toBe('/')
  })

  it('login_ExternalNextPath_IgnoredAndCallbackRedirectsHome', async () => {
    stubGithubToken()
    const login = await startLogin('https://evil.example/steal')

    const callback = await finishCallback(login.cookies, login.state)

    expect(callback.headers.get('location')).toBe('/')
  })

  it('login_ProtocolRelativeNextPath_IgnoredAndCallbackRedirectsHome', async () => {
    stubGithubToken()
    const login = await startLogin('//evil.example/steal')

    const callback = await finishCallback(login.cookies, login.state)

    expect(callback.headers.get('location')).toBe('/')
  })
})
