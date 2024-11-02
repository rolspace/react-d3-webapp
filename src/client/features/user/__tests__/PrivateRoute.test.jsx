import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../../../utils/testUtils'
import PrivateRoute from '../PrivateRoute'

test('PrivateRoute renders content correctly when "code" and "state" are provided', async () => {
  const searchValue = '?code=code&state=state'

  const location = {
    ...window.location,
    search: searchValue,
  }

  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  })

  renderWithProviders(
    <PrivateRoute
      component={<></>}
      path="/path"
      pathname="/path"
      search={searchValue}
    >
      <></>
    </PrivateRoute>,
    {
      preloadedState: {
        user: {
          token: '',
          error: null,
        },
      },
    },
  )

  expect(await screen.findByText(/Requesting access\.\.\./i)).toBeInTheDocument()
})
