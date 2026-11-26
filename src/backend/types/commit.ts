interface CommitAuthor {
  user: {
    login: string;
  } | null;
}

export interface CommitNode {
  additions: number;
  deletions: number;
  changedFiles: number;
  committedDate: string | null;
  oid: string;
  author: CommitAuthor | null;
}

export interface CommitEdge {
  node: CommitNode;
}

export interface CommitHistory {
  pageInfo: {
    hasNextPage: boolean;
  };
  edges: CommitEdge[];
}

export interface GitHubRepositoryResponse {
  repository: {
    ref: {
      target: {
        id: string;
        history: CommitHistory;
      };
    } | null;
  };
}

export interface CommitRow {
  oid: string;
  date: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  author: string | null;
}

export interface RepoCommitsResponse {
  commits: CommitRow[];
  hasNextPage: boolean;
}
