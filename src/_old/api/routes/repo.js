import axios from 'axios'
import { getQuery } from '../lib/queries.js'
import { BAD_REQUEST, OK } from '../lib/status.js'

export const post = async (req, res, next) => {
  try {
    const {
      body: { token },
      params: { owner, name },
    } = req

    if (!token) {
      return res
        .status(BAD_REQUEST)
        .send({ message: 'Token is required.' })
    }

    if (!owner || !name) {
      return res
        .status(BAD_REQUEST)
        .send({ message: `${owner ? 'name' : 'owner'} is required.` })
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

    res.status(OK).send(edges)
  } catch (error) {
    next(error)
  }
}
