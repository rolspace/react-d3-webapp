const path = require('path')
const rp = require('request-promise-native')
const constants = require('../common/constants')
const ServerError = require('../common/error')
const logger = require('../common/logger')

const ns = path.relative(process.cwd(), __filename)
const httpStatus = constants.http

const post = async (req, res, next) => {
  try {
    const { code, state } = req.body

    if (!code || !state ) {
      logger.error({ ns: `${ns}:post`}, `Parameter ${!code ? 'code' : 'state'} is undefined`)
      const serverError = new ServerError({
        message: `Parameter ${!code ? 'code' : 'state'} is undefined`,
        status: httpStatus.unprocessable
      })

      return res.status(serverError.status).send(serverError)
    }

    const options = {
      method: 'POST',
      uri: 'https://github.com/login/oauth/access_token',
      headers: {
        'Accept': 'application/json'
      },
      formData: {
        client_id: process.env.APPLICATION_ID,
        client_secret: process.env.APPLICATION_SECRET,
        code: code,
        state: state
      }
    }

    const json = await rp.post(options)
    logger.info({ ns: `${ns}:post`, message: 'Github request successful', result: json })

    res.status(httpStatus.ok).send(json)
  }
  catch (error) {
    logger.error({ ns:`${ns}:post`, error }, 'Github request failed')
    next(error)
  }
}

module.exports = {
  post
}