import axios from 'axios'
import { status } from '../lib/constants.js'
import { logger } from '../lib/logger.js'

const ns = 'routes/token'
const { ok } = status

export const post = async (req, res, next) => {
  try {
    const {
      body: { code, state },
    } = req
    if (!code || !state) {
      throw new Error(`Parameter ${!code ? 'code' : 'state'} is undefined`)
    }

    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.APPLICATION_ID,
        client_secret: process.env.APPLICATION_SECRET,
        code,
        state,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const { data } = response
    logger.info({ ns: `${ns}:post`, response }, 'request successful')

    res.status(ok).send(data)
  } catch (error) {
    next(error)
  }
}
