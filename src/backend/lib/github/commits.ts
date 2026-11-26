import { CommitEdge, CommitHistory, CommitRow, RepoCommitsResponse } from '../../types/commit.js'

export function toCommitRow({ node }: CommitEdge): CommitRow {
  return {
    oid: node.oid,
    date: node.committedDate ?? null,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
    author: node.author?.user?.login ?? null,
  }
}

export function toRepoCommitsResponse(history: CommitHistory | null | undefined): RepoCommitsResponse {
  if (!history) {
    return { commits: [], hasNextPage: false }
  }

  return {
    commits: history.edges.map(toCommitRow),
    hasNextPage: history.pageInfo.hasNextPage,
  }
}
