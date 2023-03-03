const path = require('path')
const rp = require('request-promise-native')
const constants = require('../common/constants')
const logger = require('../common/logger')
const queries = require('../common/queries')

const ns = path.relative(process.cwd(), __filename)
const { status } = constants

const post = async (req, res, next) => {
  try {
    const { token } = req.body

    if (!token) {
      return res
        .status(status.unprocessable)
        .send({ message: 'token not provided' })
    }

    const query = queries.getQuery('repo-commits')
    if (!query) {
      throw new Error('the query file repo-commits does not exist')
    }

    const { owner, name } = req.params
    if (!owner || !name) {
      throw new Error(`parameter ${!owner ? 'owner' : 'name'} is undefined`)
    }

    const options = {
      method: 'POST',
      uri: 'https://api.github.com/graphql',
      json: true,
      headers: {
        authorization: `bearer ${token}`,
        'User-Agent': 'react-d3-webapp',
      },
      body: {
        query: query.data
          .replace('%NAME%', req.params.name)
          .replace('%OWNER%', req.params.owner),
      },
    }

    const response = await rp.post(options)
    logger.info({ ns: `${ns}:post`, response }, 'request successful')

    const repoHistory = {
      data: response.data.repository.ref.target.history.edges,
    }
    res.status(status.ok).send(repoHistory)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  post,
}
