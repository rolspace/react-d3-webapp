import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AppRouter from '../AppRouter'

const server = setupServer()

class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  process.env.API_URL = 'http://localhost'
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

afterAll(() => {
  server.close()
  delete process.env.API_URL
})

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  )

describe('AppRouter', () => {
  it('AppRouter_RootPathAuthenticated_RendersHomePage', async () => {
    server.use(
      http.get('http://localhost/api/user/me', () => HttpResponse.json({ login: 'octocat' })),
    )

    const { container } = renderAt('/')

    await waitFor(() => expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(4))
    expect(screen.getByRole('heading', { name: 'Adds / Deletes', level: 2 })).toBeInTheDocument()
  })

  it('AppRouter_RootPathUnauthenticated_RedirectsToLogin', async () => {
    server.use(
      http.get('http://localhost/api/user/me', () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    const replaceSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, replace: replaceSpy })

    const { container } = renderAt('/')

    await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith('/login'))
    expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(0)
  })
})
