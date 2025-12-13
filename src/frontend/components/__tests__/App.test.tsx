import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithStores, screen, waitFor } from '../../utils/testUtils'
import { App } from '../App'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the app title', () => {
    vi.spyOn(api, 'fetchSampleData').mockResolvedValue([])

    renderWithStores(<App />)

    expect(screen.getByText('BFF Demo Application')).toBeInTheDocument()
  })

  it('should fetch items on mount', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
    ]

    vi.spyOn(api, 'fetchSampleData').mockResolvedValue(mockItems)

    renderWithStores(<App />)

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    vi.spyOn(api, 'fetchSampleData').mockImplementation(
      () => new Promise(() => {}),
    )

    renderWithStores(<App />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
