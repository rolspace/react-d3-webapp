import axios from 'axios'
import path from 'path'
import * as url from 'url'
import { status } from '../common/constants.js'
import { logger } from '../common/logger.js'
import { getQuery } from '../common/queries.js'

const __filename = url.fileURLToPath(import.meta.url)
const ns = path.relative(process.cwd(), __filename)
const { ok, unprocessable } = status

export const post = async (req, res, next) => {
  try {
    const {
      body: { token },
    } = req

    if (!token) {
      return res.status(unprocessable).send({ message: 'token not provided' })
    }

    const { text: queryText } = getQuery('repo-commits')
    if (!queryText) {
      throw new Error(
        'the query file repo-commits does not exist or it is empty',
      )
    }

    const {
      params: { owner, name },
    } = req
    if (!owner || !name) {
      throw new Error(`parameter ${!owner ? 'owner' : 'name'} is undefined`)
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
