import '@testing-library/jest-dom/extend-expect'
import { screen } from '@testing-library/react'
import React, { Fragment } from 'react'
import { renderWithProviders } from '../../../utils/testUtils'
import PrivateRoute from '../PrivateRoute'
import { BrowserRouter } from 'react-router-dom'

const location = {
  ...window.location,
  search: '?code=code&state=state',
}

Object.defineProperty(window, 'location', {
  writable: true,
  value: location,
})

test('PrivateRoute fetches user token and renders correct component', () => {
  renderWithProviders(
    <BrowserRouter>
      <PrivateRoute component={<></>} path="/path" />
    </BrowserRouter>,
    {
      preloadedState: {
        user: {
          token: '',
          error: null,
        },
      },
    },
  )

  expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument()
})
