import { create } from 'zustand'

export interface UserState {
  token: string
  error: Error | null
  fetchToken: ({ code, state }: { code: string; state: string }) => Promise<void>
  clearToken: () => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  token: '',
  error: null,

  fetchToken: async ({ code, state }) => {
    try {
      set({ token: '', error: null })

      const response = await fetch(`${process.env.API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
        }),
      })

      if (response.ok) {
        const { accessToken } = await response.json()
        set({ token: accessToken, error: null })
      } else {
        const { statusText } = response
        throw new Error(statusText)
      }
    } catch (error) {
      set({
        token: '',
        error: error instanceof Error ? error : new Error('Unknown error'),
      })

      throw error
    }
  },
  clearToken: () => set({ token: '', error: null }),
  clearError: () => set({ error: null }),
}))
