/* eslint-disable import/first */
import './common/config.js'

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'
import * as url from 'url'
import { cors as corsConstants, status } from './common/constants.js'
import { logger } from './common/logger.js'
import { loadQueries } from './common/queries.js'
import { allIncomingHandler } from './middleware/allIncoming.js'
import { catchErrorHandler } from './middleware/catchErrors.js'
import { post as repoPostHandler } from './routes/repo.js'
import { post as tokenPostHandler } from './routes/token.js'

const app = express()
const __filename = url.fileURLToPath(import.meta.url)
const ns = path.relative(process.cwd(), __filename)

const init = () => {
  loadQueries()

  app.use(bodyParser.json())
  app.use(cors(corsConstants))
  app.use(allIncomingHandler)

  app.options('/api/token')
  app.post('/api/token', tokenPostHandler)
  app.post('/api/repo/:owner/:name', repoPostHandler)

  app.use((req, res) => {
    logger.warn({ ns: `${ns}:init` }, 'Resource not found')
    res.status(status.notFound).send({ message: 'Resource not found' })
  })

  app.use(catchErrorHandler)

  const port = process.env.PORT || 9000

  app.set('port', port)

  app.listen(port, () => {
    logger.info(
      { ns: `${ns}:init` },
      `Server started and listening on port: ${port}`,
    )
  })
}

init()
