// Sample data item
export interface SampleItem {
  id: number
  name: string
  value: number
}

// Health check response
export interface HealthResponse {
  status: string
  timestamp: string
}

// API error response
export interface ErrorResponse {
  error: string
  message: string
}

// App store state
export interface AppState {
  items: SampleItem[]
  loading: boolean
  error: Error | null
  fetchItems: () => Promise<void>
  addItem: (item: Omit<SampleItem, 'id'>) => Promise<void>
  clearError: () => void
}
