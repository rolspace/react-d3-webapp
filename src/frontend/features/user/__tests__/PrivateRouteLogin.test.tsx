import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useUserStore } from '../../../stores/userStore'
import { resetStores } from '../../../utils/testUtils'
import PrivateRoute from '../PrivateRoute'

describe('PrivateRoute login redirect', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('PrivateRoute_NoToken_RedirectsToGithubWithClientId', () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'test-client-id')
    const replaceSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, replace: replaceSpy })
    resetStores()
    useUserStore.setState({ token: '' })

    render(
      <PrivateRoute path="/graphs/x" pathname="/graphs/x" search="">
        <div>child</div>
      </PrivateRoute>,
    )

    expect(replaceSpy).toHaveBeenCalledTimes(1)
    const url = new URL(replaceSpy.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe('https://github.com/login/oauth/authorize')
    expect(url.searchParams.get('client_id')).toBe('test-client-id')
    expect(url.searchParams.get('redirect_uri')).toMatch(/\/graphs\/x$/)
  })
})
