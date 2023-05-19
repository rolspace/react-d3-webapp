import fs from 'fs'
import { logger } from './logger.js'

const ns = 'lib/queries'
const queries = []

export const getQuery = (name) => {
  logger.info({ ns: `${ns}:getQuery` }, `Getting query: ${name}`)

  return queries.find((query) => name === query.name)
}

export const loadQueries = () => {
  fs.readdir('data', (error, files) => {
    if (error) {
      logger.error(
        { ns: `${ns}:loadQueries`, error },
        'Could not read data directory',
      )
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        const fileData = []

        const readStream = fs.createReadStream(`data/${file}`)
        readStream.on('data', (chunk) => {
          fileData.push(chunk)
        })
        readStream.on('end', () => {
          queries.push({
            name: file,
            text: Buffer.concat(fileData).toString(),
          })
        })
        readStream.on('error', (error) => {
          logger.error(
            {
              ns: `${ns}:loadQueries`,
              error,
            }` Could not read stream from 'data/${file}'`,
          )
        })
      })
    }
  })
}
