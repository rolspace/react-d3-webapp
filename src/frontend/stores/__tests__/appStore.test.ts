import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from '../appStore'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('appStore', () => {
  beforeEach(() => {
    useAppStore.setState({ items: [], loading: false, error: null })
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const state = useAppStore.getState()

    expect(state.items).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBe(null)
  })

  it('should fetch items successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
    ]

    vi.spyOn(api, 'fetchSampleData').mockResolvedValue(mockItems)

    const { fetchItems } = useAppStore.getState()
    await fetchItems()

    const state = useAppStore.getState()
    expect(state.items).toEqual(mockItems)
    expect(state.loading).toBe(false)
    expect(state.error).toBe(null)
  })

  it('should handle fetch errors', async () => {
    const error = new Error('API error')
    vi.spyOn(api, 'fetchSampleData').mockRejectedValue(error)

    const { fetchItems } = useAppStore.getState()
    await fetchItems()

    const state = useAppStore.getState()
    expect(state.error).toEqual(error)
    expect(state.loading).toBe(false)
  })

  it('should add item successfully', async () => {
    const newItem = { id: 1, name: 'New Item', value: 150 }
    vi.spyOn(api, 'createSampleItem').mockResolvedValue(newItem)

    const { addItem } = useAppStore.getState()
    await addItem({ name: 'New Item', value: 150 })

    const state = useAppStore.getState()
    expect(state.items).toContainEqual(newItem)
    expect(state.loading).toBe(false)
  })

  it('should clear error', () => {
    useAppStore.setState({ error: new Error('Test error') })

    const { clearError } = useAppStore.getState()
    clearError()

    const state = useAppStore.getState()
    expect(state.error).toBe(null)
  })
})
