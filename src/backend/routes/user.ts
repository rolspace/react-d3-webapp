import { graphql } from '@octokit/graphql'
import { NextFunction, Request, Response } from 'express'
import { OK, UNAUTHORIZED } from '../lib/status.js'
import { GitHubUserResponse } from '../types/user.js'

const query = `
  query GetAuthenticatedUser {
    viewer {
      login
      name
      email
      avatarUrl
      bio
      company
      location
      websiteUrl
      twitterUsername
      createdAt
      updatedAt
    }
  }
`

export const get = async (req: Request, res: Response, next: NextFunction) => {
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

    const { viewer } = await graphqlWithAuth(query) as GitHubUserResponse

    res.status(OK).json(viewer)
  } catch (error) {
    next(error)
  }
}
