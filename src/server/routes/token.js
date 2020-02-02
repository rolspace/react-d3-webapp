const path = require('path')
const rp = require('request-promise-native')
const constants = require('../common/constants')
const logger = require('../common/logger')

const ns = path.relative(process.cwd(), __filename)
const { status } = constants

const post = async (req, res, next) => {
  try {
    const { code, state } = req.body
    if (!code || !state ) throw new Error(`Parameter ${!code ? 'code' : 'state'} is undefined`)

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

    res.status(status.ok).send(json)
  }
  catch (error) {
    next(error)
  }
}

module.exports = {
  post
}
