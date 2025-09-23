import { create } from 'zustand'
import { createHighRange, createLowRange } from '../services/range.ts'

export const useRepoStore = create((set, get) => ({
  owner: 'facebook',
  repository: 'react',
  commits: {
    changedFiles: [],
    linesAdded: [],
    linesDeleted: [],
  },
  loading: 'idle',
  fulfilled: false,
  error: null,

  setRepo: ({ ownerValue, repositoryValue }) => {
    set({
      owner: ownerValue,
      repository: repositoryValue,
      loading: 'idle',
      fulfilled: false,
      error: null,
      commits: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
    })
  },

  fetchRepo: async ({ owner, repository, token }) => {
    try {
      set({
        loading: 'pending',
        fulfilled: false,
        error: null,
        commits: {
          changedFiles: [],
          linesAdded: [],
          linesDeleted: [],
        },
      })

      const response = await fetch(
        `${process.env.API_URL}/api/repo/${owner}/${repository}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
          }),
        },
      )

      const result = await response.json()

      set({ loading: 'idle', fulfilled: true })

      if (response.ok) {
        set({
          commits: {
            changedFiles: createLowRange(result, 'changedFiles'),
            linesAdded: createHighRange(result, 'additions'),
            linesDeleted: createHighRange(result, 'deletions'),
          },
        })
      } else {
        set({ error: result })
      }
    } catch (error) {
      set({
        loading: 'idle',
        fulfilled: true,
        error,
        commits: {
          changedFiles: [],
          linesAdded: [],
          linesDeleted: [],
        },
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  resetRepo: () =>
    set({
      owner: 'facebook',
      repository: 'react',
      commits: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
      loading: 'idle',
      fulfilled: false,
      error: null,
    }),
}))
