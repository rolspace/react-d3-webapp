import fs from 'fs'
import path from 'path'
import * as url from 'url'
import { logger } from './logger.js'

const __filename = url.fileURLToPath(import.meta.url)
const ns = path.relative(process.cwd(), __filename)
const queries = []

export const getQuery = (name) => {
  logger.info({ ns: `${ns}:get` }, `Getting query: ${name}`)

  return queries.find((query) => name === query.name)
}

export const loadQueries = () => {
  fs.readdir('queries', (error, files) => {
    if (error) {
      logger.error(
        { ns: `${ns}:load`, error },
        'Could not read queries directory',
      )
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        const fileData = []

        const readStream = fs.createReadStream(`queries/${file}`)
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
              ns: `${ns}:load`,
              error,
            }` Could not read stream from 'queries/${file}'`,
          )
        })
      })
    }
  })
}
