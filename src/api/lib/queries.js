import fs from 'fs'
import { logger } from './logger.js'

const ns = 'lib/queries'
const queries = []

export const getQuery = (name) => {
  if (!name) {
    throw new Error('Parameter "name" not provided')
  }

  logger.debug({ ns: `${ns}:getQuery` }, `Getting query: ${name}`)

  const query = queries.find((query) => name === query.name)

  if (!query) {
    throw new Error(`Query ${name} not found`)
  }

  return query
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
