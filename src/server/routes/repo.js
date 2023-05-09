const axios = require('axios')
const path = require('path')
const constants = require('../common/constants')
const logger = require('../common/logger')
const queries = require('../common/queries')

const ns = path.relative(process.cwd(), __filename)
const {
  status: { ok, unprocessable },
} = constants

const post = async (req, res, next) => {
  try {
    const {
      body: { token },
    } = req

    if (!token) {
      return res.status(unprocessable).send({ message: 'token not provided' })
    }

    const { text: queryText } = queries.getQuery('repo-commits')
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

module.exports = {
  post,
}
