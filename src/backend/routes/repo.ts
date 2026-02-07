import { graphql } from '@octokit/graphql'
import { GraphQlQueryResponse } from '@octokit/graphql/types'
import { NextFunction, Request, Response } from 'express'
import { OK, UNAUTHORIZED } from '../lib/status.js'
import { GitHubRepositoryResponse } from '../types/commit.js'
import { parse } from 'path'
import { parseRepoEdges } from '../lib/github/parser.js'

const query = `
  query GetRepoCommits($owner: String!, $repo: String!) {
    repository(name: $repo, owner: $owner) {
      ref(qualifiedName: "main") {
        target {
          ... on Commit {
            id
            history(first: 100) {
              pageInfo {
                hasNextPage
              }
              edges {
                node {
                  additions
                  deletions
                  changedFiles
                  pushedDate
                  oid
                  author {
                    user {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { owner, repo } } = req

  if (!req.session || !req.session.accessToken) {
    res.status(UNAUTHORIZED).json({ error: 'Unauthorized' })
    return
  }

  const { session: { accessToken } } = req

  try {
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      request: {
        signal: AbortSignal.timeout(process.env.GRAPHQL_TIMEOUT ? parseInt(process.env.GRAPHQL_TIMEOUT) : 5000),
      },
    })

    const { repository: { ref: { target: { history: { edges } } } }  } = await graphqlWithAuth(query, { owner, repo }) as GitHubRepositoryResponse

    const repoSeries = parseRepoEdges(edges, ['additions', 'deletions', 'changedFiles'])

    res.status(OK).json(repoSeries)
  } catch (error) {
    next(error)
  }
}
