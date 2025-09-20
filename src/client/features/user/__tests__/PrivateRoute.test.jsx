import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/react'
import React from 'react'
import PrivateRoute from '../PrivateRoute'

describe('PrivateRoute', () => {
  it('renders content correctly when "code" and "state" are provided', async () => {
    const searchValue = '?code=code&state=state'

    const location = {
      ...window.location,
      search: searchValue,
    }

    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    })

      <PrivateRoute
        component={<></>}
        path="/path"
        pathname="/path"
        search={searchValue}
      >
        <></>
      </PrivateRoute>,
      {
        },
      },
    )

  })
})
