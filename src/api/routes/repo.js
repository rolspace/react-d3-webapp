import axios from 'axios'
import { status } from '../lib/constants.js'
import { getQuery } from '../lib/queries.js'

const { notFound, ok, unprocessable } = status

export const post = async (req, res, next) => {
  try {
    const {
      body: { token },
      params: { owner, name },
    } = req

    if (!owner || !name) {
      return res
        .status(notFound)
        .send({ message: 'Requested repository not found' })
    }

    if (!token) {
      return res
        .status(unprocessable)
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

    res.status(ok).send({ data: edges })
  } catch (error) {
    next(error)
  }
}
