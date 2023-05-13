import axios from 'axios'
import path from 'path'
import * as url from 'url'
import { status } from '../lib/constants.js'
import { logger } from '../lib/logger.js'
import { getQuery } from '../lib/queries.js'

const __filename = url.fileURLToPath(import.meta.url)
const ns = path.relative(process.cwd(), __filename)

const { notFound, ok, unprocessable } = status

export const post = async (req, res, next) => {
  try {
    const {
      body: { token },
      params: { owner, name },
    } = req

    if (!token) {
      console.log('!roken')
      return res
        .status(unprocessable)
        .send({ message: 'No token in the request' })
    }

    if (!owner || !name) {
      logger.error(
        { ns: `${ns}:post`, req },
        `parameter ${!owner ? 'owner' : 'name'} is undefined`,
      )
      return res.status(notFound).send({ message: 'Not Found' })
    }

    const { text: queryText } = getQuery('repo-commits')
    if (!queryText) {
      throw new Error(
        'the query file repo-commits does not exist or it is empty',
      )
    }

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query: queryText.replace('%NAME%', name).replace('%OWNER%', owner),
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `bearer ${token}`,
          'User-Agent': 'react-d3-webapp',
        },
      },
    )

    logger.info({ ns: `${ns}:post`, response }, 'request successful')

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
