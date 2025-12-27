// import { ReactElement } from 'react'
// import { render, RenderOptions } from '@testing-library/react'
// import { useAppStore } from '../stores/appStore'

// // Reset all stores before each test
// export const resetStores = () => {
//   useAppStore.setState({
//     items: [],
//     loading: false,
//     error: null,
//   })
// }

// // Custom render function that resets stores
// export function renderWithStores(
//   ui: ReactElement,
//   options?: Omit<RenderOptions, 'wrapper'>,
// ) {
//   resetStores()
//   return render(ui, options)
// }

// // Re-export everything from testing library
// export * from '@testing-library/react'

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { useUserStore, UserState } from '../stores/userStore'
import { useRepoStore, RepoStore } from '../stores/repoStore'
import { Status } from '../types/state.types'

interface RenderWithStoresOptions extends Omit<RenderOptions, 'wrapper'> {
  userInitialState?: Partial<UserState>
  repoInitialState?: Partial<RepoStore>
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
    commitData: {
      changedFiles: [],
      linesAdded: [],
      linesDeleted: [],
    },
    status: Status.Idle,
    error: null,
  })
}

// Legacy function name for backward compatibility
export const renderWithProviders = renderWithStores
