import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import PropTypes from 'prop-types'
import React from 'react'
import { Provider } from 'react-redux'
import repoReducer from '../features/repo/repoSlice'
import userReducer from '../features/user/userSlice'

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: { repo: repoReducer, user: userReducer },
      preloadedState,
    }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }

  Wrapper.propTypes = {
    children: PropTypes.element.isRequired,
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
