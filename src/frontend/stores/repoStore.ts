import { create } from 'zustand'
import { CommitRow, RepoCommitsResponse } from '../types/commit.types'
import { Status } from '../types/state.types'

interface RepoIdentifier {
  owner: string
  repository: string
}

interface RepoProperties {
  commits: CommitRow[]
  hasNextPage: boolean
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

// A function so that each reset gets a new array.
const emptyCommits = (): Pick<RepoProperties, 'commits' | 'hasNextPage'> => ({
  commits: [],
  hasNextPage: false,
})

export const useRepoStore = create<RepoStore>((set) => ({
  owner: 'facebook',
  repository: 'react',
  ...emptyCommits(),
  status: Status.Idle,
  error: null,

  setRepo: ({ owner, repository }: RepoIdentifier) => {
    set({
      owner,
      repository,
      status: Status.Idle,
      error: null,
      ...emptyCommits(),
    })
  },
  fetchRepo: async ({ owner, repository, token }) => {
    try {
      set({
        status: Status.Pending,
        error: null,
        ...emptyCommits(),
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

      const result: RepoCommitsResponse = await response.json()

      if (response.ok) {
        set({
          status: Status.Success,
          commits: Array.isArray(result.commits) ? result.commits : [],
          hasNextPage: result.hasNextPage === true,
        })
      } else {
        const { statusText } = response
        throw new Error(statusText)
      }
    } catch (error) {
      set({
        status: Status.Failure,
        error: error instanceof Error ? error : new Error('Unknown error'),
        ...emptyCommits(),
      })

      throw error
    }
  },
  clearRepo: () =>
    set({
      owner: 'facebook',
      repository: 'react',
      ...emptyCommits(),
      status: Status.Idle,
      error: null,
    }),
  clearError: () => set({ error: null }),
}))
