import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import RequireAuth from '../RequireAuth'

const server = setupServer()

beforeAll(() => {
  process.env.API_URL = 'http://localhost'
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.restoreAllMocks()
})

afterAll(() => {
  server.close()
  delete process.env.API_URL
})

describe('RequireAuth', () => {
  it('RequireAuth_SessionValid_RendersChildren', async () => {
    server.use(
      http.get('http://localhost/api/user/me', () =>
        HttpResponse.json({ login: 'octocat' }),
      ),
    )
    const replaceSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, replace: replaceSpy })

    render(
      <RequireAuth>
        <span>protected content</span>
      </RequireAuth>,
    )

    expect(await screen.findByText('protected content')).toBeInTheDocument()
    expect(replaceSpy).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('RequireAuth_Unauthorized_RedirectsToLoginWithoutChildren', async () => {
    server.use(
      http.get('http://localhost/api/user/me', () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    const replaceSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, replace: replaceSpy })

    render(
      <RequireAuth>
        <span>protected content</span>
      </RequireAuth>,
    )

    await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()

    vi.unstubAllGlobals()
  })
})
