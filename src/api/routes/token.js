import axios from 'axios'
import { status } from '../lib/constants.js'

const { ok, unprocessable } = status

export const post = async (req, res, next) => {
  try {
    const {
      body: { code, state },
    } = req

    if (!code || !state) {
      return res
        .status(unprocessable)
        .send({ message: 'No token sent in the request' })
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

    res.status(ok).send(data)
  } catch (error) {
    next(error)
  }
}
