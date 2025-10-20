import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { useUserStore } from '../stores/userStore'
import { useRepoStore } from '../stores/repoStore'

interface UserInitialState {
  token?: string
  error?: string | null
}

interface RepoInitialState {
  owner?: string
  repository?: string
  commits?: {
    changedFiles: any[]
    linesAdded: any[]
    linesDeleted: any[]
  }
  loading?: 'idle' | 'pending'
  fulfilled?: boolean
  error?: any | null
}

interface RenderWithStoresOptions extends Omit<RenderOptions, 'wrapper'> {
  userInitialState?: UserInitialState
  repoInitialState?: RepoInitialState
}

export function renderWithStores(
  ui: ReactElement,
  {
    userInitialState = {},
    repoInitialState = {},
    ...renderOptions
  }: RenderWithStoresOptions = {},
) {
  // Initialize stores before rendering
  if (Object.keys(userInitialState).length > 0) {
    useUserStore.setState(userInitialState)
  }
  if (Object.keys(repoInitialState).length > 0) {
    useRepoStore.setState(repoInitialState)
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return children
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
