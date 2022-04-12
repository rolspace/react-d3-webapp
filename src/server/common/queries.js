const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const ns = path.relative(process.cwd(), __filename)
const queries = []

const getQuery = (name) => {
  logger.info({ ns: `${ns}:get` }, `Getting query: ${name}`)

  return queries.find((query) => name === query.name)
}

const loadQueries = () => {
  fs.readdir('queries', (error, files) => {
    if (error) {
      logger.error(
        { ns: `${ns}:load`, error },
        'Could not read queries directory',
      )
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        const data = []

        const readStream = fs.createReadStream(`queries/${file}`)
        readStream.on('data', (chunk) => {
          data.push(chunk)
        })
        readStream.on('end', () => {
          queries.push({
            name: file,
            data: Buffer.concat(data).toString(),
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

module.exports = {
  getQuery,
  loadQueries,
}
