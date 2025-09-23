import { create } from 'zustand'

export const useUserStore = create((set, get) => ({
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
        set({ token: '', error: statusText })
      }
    } catch (error) {
      set({ token: '', error })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  clearToken: () => set({ token: '', error: null }),
}))
