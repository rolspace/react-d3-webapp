import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchHealth, fetchSampleData, createSampleItem } from '../api'

global.fetch = vi.fn()

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchHealth', () => {
    it('should fetch health status', async () => {
      const mockResponse = { status: 'ok', timestamp: '2024-01-01T00:00:00Z' }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchHealth()

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health'),
      )
    })
  })

  describe('fetchSampleData', () => {
    it('should fetch sample data', async () => {
      const mockData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ]

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const result = await fetchSampleData()

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sample'),
      )
    })

    it('should throw error on failed request', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Error', message: 'Server error' }),
      })

      await expect(fetchSampleData()).rejects.toThrow('Server error')
    })
  })

  describe('createSampleItem', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'New Item', value: 300 }
      const mockResponse = { id: 3, ...newItem }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await createSampleItem(newItem)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sample'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }),
      )
    })
  })
})
