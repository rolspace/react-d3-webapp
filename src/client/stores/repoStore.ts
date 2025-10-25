import { create } from 'zustand'
import { createHighRange, createLowRange } from '../services/range'
import { DataItem } from '../types/graph.types'

export interface CommitData {
  changedFiles?: DataItem[]
  linesAdded?: DataItem[]
  linesDeleted?: DataItem[]
}

interface RepoIdentifier {
  owner: string
  repository: string
}

interface RepoProperties {
  commitData: CommitData
  loading: 'idle' | 'pending'
  fulfilled: boolean
  error: any | null
}

interface RepoActions {
  setRepo: ({ owner, repository }: RepoIdentifier) => void
  fetchRepo: ({ owner, repository, token }: RepoIdentifier & { token: string}) => Promise<void>
  clearRepo: () => void
  clearError: () => void
}

type RepoStore = RepoIdentifier & RepoProperties & RepoActions

export const useRepoStore = create<RepoStore>((set, get) => ({
  owner: 'facebook',
  repository: 'react',
  commitData: {
    changedFiles: [],
    linesAdded: [],
    linesDeleted: [],
  },
  loading: 'idle',
  fulfilled: false,
  error: null,

  setRepo: ({ owner, repository }: RepoIdentifier) => {
    set({
      owner,
      repository,
      loading: 'idle',
      fulfilled: false,
      error: null,
      commitData: {
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
        commitData: {
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
          commitData: {
            changedFiles: createLowRange(result, 'changedFiles'),
            linesAdded: createHighRange(result, 'additions'),
            linesDeleted: createHighRange(result, 'deletions'),
          },
        })
      }
    } catch (error) {
      set({
        loading: 'idle',
        fulfilled: true,
        error,
        commitData: {
          changedFiles: [],
          linesAdded: [],
          linesDeleted: [],
        },
      })
      throw error
    }
  },
  clearRepo: () =>
    set({
      owner: 'facebook',
      repository: 'react',
      commitData: {
        changedFiles: [],
        linesAdded: [],
        linesDeleted: [],
      },
      loading: 'idle',
      fulfilled: false,
      error: null,
    }),
  clearError: () => set({ error: null }),
}))
