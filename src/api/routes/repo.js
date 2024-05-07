import axios from 'axios'
import { getQuery } from '../lib/queries.js'
import { NOT_FOUND, OK, UNPROCESSABLE } from '../lib/status.js'

export const post = async (req, res, next) => {
  try {
    const {
      body: { token },
      params: { owner, name },
    } = req

    if (!owner || !name) {
      return res
        .status(NOT_FOUND)
        .send({ message: 'Requested repository not found' })
    }

    if (!token) {
      return res
        .status(UNPROCESSABLE)
        .send({ message: 'No token sent in the request' })
    }

    const { text } = getQuery('repoCommits')

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query: text.replace('%NAME%', name).replace('%OWNER%', owner),
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `bearer ${token}`,
          'User-Agent': 'react-d3-api',
        },
      },
    )

    const {
      data: {
        data: {
          repository: {
            ref: {
              target: {
                history: { edges },
              },
            },
          },
        },
      },
    } = response

    res.status(OK).send({ data: edges })
  } catch (error) {
    next(error)
  }
}
