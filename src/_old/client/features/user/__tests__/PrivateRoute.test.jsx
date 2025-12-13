import '@testing-library/jest-dom/vitest'
import { cleanup, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithStores, resetStores } from '../../../utils/testUtils'
import PrivateRoute from '../PrivateRoute'

const handlers = [
  http.post(/\/api\/token\//, () => {
    return HttpResponse.json({
      accessToken: 'mock-token',
    })
  }),
]

const server = setupServer(...handlers)

describe('PrivateRoute', () => {
  beforeAll(() => server.listen())

  afterAll(() => server.close())

  beforeEach(() => {
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    resetStores()
  })

  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })

  it('renders content correctly when "code" and "state" are provided', async () => {
    process.env.API_URL = 'http://localhost'

    const searchValue = '?code=code&state=state'

    const location = {
      ...window.location,
      search: searchValue,
    }

    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    })

    renderWithStores(
      <PrivateRoute
        component={<></>}
        path="/path"
        pathname="/path"
        search={searchValue}
      >
        <div>child</div>
      </PrivateRoute>,
      {
        userInitialState: {
          token: '',
          error: null,
        },
      },
    )

    expect(await screen.findByText(/child/)).toBeInTheDocument()
  })
})
