import axios from 'axios'
import { BAD_REQUEST, OK } from '../lib/status.js'

export const post = async (req, res, next) => {
  try {
    const {
      body: { code, state },
    } = req

    if (!code || !state) {
      return res
        .status(BAD_REQUEST)
        .send({ message: `${code ? 'state' : 'code'} is required.` })
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

    const { data: { access_token: accessToken } } = response

    res.status(OK).send({ accessToken })
  } catch (error) {
    next(error)
  }
}
