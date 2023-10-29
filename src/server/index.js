/* eslint-disable import/first */
import './lib/config.js'

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { cors as corsConstants, port } from './lib/constants.js'
import { logger } from './lib/logger.js'
import { loadQueries } from './lib/queries.js'
import { catchErrorHandler } from './middleware/catchError.js'
import { logRequestHandler } from './middleware/logRequest.js'
import { notFoundHandler } from './middleware/notFound.js'
import { post as postRepoHandler } from './routes/repo.js'
import { post as postTokenHandler } from './routes/token.js'

const ns = 'index'
const app = express()

const init = () => {
  loadQueries()

  app.use(...[bodyParser.json(), cors(corsConstants), logRequestHandler])

  app.options('/api/token')
  app.post('/api/token', postTokenHandler)
  app.post('/api/repo/:owner/:name', postRepoHandler)

  app.use(...[notFoundHandler, catchErrorHandler])

  app.set('port', port)

  app.listen(port, () => {
    logger.info(
      { ns: `${ns}:init` },
      `Server started and listening on port: ${port}`,
    )
  })
}

init()
