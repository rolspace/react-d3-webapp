import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithStores, resetStores } from '../../../utils/testUtils'
import PrivateRoute from '../PrivateRoute'

describe('PrivateRoute', () => {
  beforeEach(() => {
    resetStores()
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'mock-token' }),
      }),
    )
  })

  it('renders content correctly when "code" and "state" are provided', async () => {
    // Set environment variable for API URL
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
        <></>
      </PrivateRoute>,
      {
        userInitialState: {
          token: '',
          error: null,
        },
      },
    )

    expect(screen.getByText('Requesting access...')).toBeInTheDocument()
  })
})
