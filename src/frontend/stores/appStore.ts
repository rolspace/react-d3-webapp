import { create } from 'zustand'
import { AppState, SampleItem } from '../types/app.types'
import { fetchSampleData, createSampleItem } from '../services/api'

export const useAppStore = create<AppState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      const items = await fetchSampleData()
      set({ items, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      })
    }
  },

  addItem: async (item: Omit<SampleItem, 'id'>) => {
    set({ loading: true, error: null })
    try {
      const newItem = await createSampleItem(item)
      const currentItems = get().items
      set({ items: [...currentItems, newItem], loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
