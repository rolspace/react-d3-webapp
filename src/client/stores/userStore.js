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

      const data = await response.json()

      if (response.ok) {
        set({ token: data.access_token, error: null })
      } else {
        set({ token: '', error: data })
      }

      return data
    } catch (error) {
      const errorPayload = { message: error.message }
      set({ token: '', error: errorPayload })
      throw errorPayload
    }
  },

  clearError: () => set({ error: null }),
  clearToken: () => set({ token: '', error: null }),
}))
