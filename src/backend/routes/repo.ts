import { Request, Response, NextFunction } from 'express'
import { GraphQLClient } from 'graphql-request'
import { OK, UNAUTHORIZED } from '../lib/status.js'

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
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(process.env.GRAPHQL_TIMEOUT ? parseInt(process.env.GRAPHQL_TIMEOUT) : 5000),
    })

    const data = await client.request(query, { owner, repo })
    res.status(OK).json(data)
  } catch (error) {
    next(error)
  }
}
