export interface CommitRow {
  oid: string
  date: string | null
  additions: number
  deletions: number
  changedFiles: number
  author: string | null
}

export interface RepoCommitsResponse {
  commits: CommitRow[]
  hasNextPage: boolean
}
