import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { useRepoStore, RepoStore } from '../stores/repoStore'
import { Status } from '../types/state.types'

interface RenderWithStoresOptions extends Omit<RenderOptions, 'wrapper'> {
  repoInitialState?: Partial<RepoStore>
}

export function renderWithStores(
  ui: ReactElement,
  {
    repoInitialState = {},
    ...renderOptions
  }: RenderWithStoresOptions = {},
) {
  // Initialize stores before rendering
  if (Object.keys(repoInitialState).length > 0) {
    useRepoStore.setState(repoInitialState)
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return children
  }

  // Return an object with access to stores and all of RTL's query functions
  return {
    repoStore: useRepoStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Helper to reset stores between tests
export function resetStores() {
  useRepoStore.setState({
    owner: 'facebook',
    repository: 'react',
    commits: [],
    hasNextPage: false,
    status: Status.Idle,
    error: null,
  })
}
