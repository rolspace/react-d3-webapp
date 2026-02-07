interface CommitAuthor {
  user: {
    login: string;
  };
}

export interface CommitNode {
  additions: number;
  deletions: number;
  changedFiles: number;
  pushedDate: string | null;
  oid: string;
  author: CommitAuthor;
}

export interface CommitEdge {
  node: CommitNode;
}

interface CommitHistory {
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
    };
  };
}
