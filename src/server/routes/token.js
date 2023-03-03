const path = require('path')
const rp = require('request-promise-native')
const constants = require('../common/constants')
const logger = require('../common/logger')

const ns = path.relative(process.cwd(), __filename)
const { status } = constants

const post = async (req, res, next) => {
  try {
    const { code, state } = req.body
    if (!code || !state) {
      throw new Error(`Parameter ${!code ? 'code' : 'state'} is undefined`)
    }

    const options = {
      method: 'POST',
      uri: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
      },
      formData: {
        client_id: process.env.APPLICATION_ID,
        client_secret: process.env.APPLICATION_SECRET,
        code,
        state,
      },
    }

    const response = await rp.post(options)
    logger.info({ ns: `${ns}:post`, response }, 'request successful')

    res.status(status.ok).send(response)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  post,
}
