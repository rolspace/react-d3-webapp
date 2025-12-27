import { create } from 'zustand'
import { createHighRange, createLowRange } from '../services/range'
import { DataItem } from '../types/graph.types'
import { Status } from '../types/state.types'

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
  status: Status
  error: Error | null
}

interface RepoActions {
  setRepo: ({ owner, repository }: RepoIdentifier) => void
  fetchRepo: ({ owner, repository, token }: RepoIdentifier & { token: string }) => Promise<void>
  clearRepo: () => void
  clearError: () => void
}

export type RepoStore = RepoIdentifier & RepoProperties & RepoActions

export const useRepoStore = create<RepoStore>((set) => ({
  owner: 'facebook',
  repository: 'react',
  commitData: {
    changedFiles: [],
    linesAdded: [],
    linesDeleted: [],
  },
  status: Status.Idle,
  error: null,

  setRepo: ({ owner, repository }: RepoIdentifier) => {
    set({
      owner,
      repository,
      status: Status.Idle,
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
        status: Status.Pending,
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

      if (response.ok) {
        set({
          status: Status.Success,
          commitData: {
            changedFiles: createLowRange(result, 'changedFiles'),
            linesAdded: createHighRange(result, 'additions'),
            linesDeleted: createHighRange(result, 'deletions'),
          },
        })
      } else {
        const { statusText } = response
        throw new Error(statusText)
      }
    } catch (error) {
      set({
        status: Status.Failure,
        error: error instanceof Error ? error : new Error('Unknown error'),
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
      status: Status.Idle,
      error: null,
    }),
  clearError: () => set({ error: null }),
}))
