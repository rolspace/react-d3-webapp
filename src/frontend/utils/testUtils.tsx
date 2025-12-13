import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { useAppStore } from '../stores/appStore'

// Reset all stores before each test
export const resetStores = () => {
  useAppStore.setState({
    items: [],
    loading: false,
    error: null,
  })
}

// Custom render function that resets stores
export function renderWithStores(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  resetStores()
  return render(ui, options)
}

// Re-export everything from testing library
export * from '@testing-library/react'
