import { render } from '@testing-library/react'
import PropTypes from 'prop-types'
import { useUserStore } from '../stores/userStore'
import { useRepoStore } from '../stores/repoStore'

export function renderWithStores(
  ui,
  {
    userInitialState = {},
    repoInitialState = {},
    ...renderOptions
  } = {},
) {
  // Initialize stores before rendering
  if (Object.keys(userInitialState).length > 0) {
    useUserStore.setState(userInitialState)
  }
  if (Object.keys(repoInitialState).length > 0) {
    useRepoStore.setState(repoInitialState)
  }

  function Wrapper({ children }) {
    return children
  }

  Wrapper.propTypes = {
    children: PropTypes.element.isRequired,
  }

  // Return an object with access to stores and all of RTL's query functions
  return {
    userStore: useUserStore,
    repoStore: useRepoStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Helper to reset stores between tests
export function resetStores() {
  useUserStore.setState({
    token: '',
    error: null,
  })
  useRepoStore.setState({
    owner: 'facebook',
    repository: 'react',
    commits: {
      changedFiles: [],
      linesAdded: [],
      linesDeleted: [],
    },
    loading: 'idle',
    fulfilled: false,
    error: null,
  })
}

// Legacy function name for backward compatibility
export const renderWithProviders = renderWithStores
