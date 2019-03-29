const fs = require('fs')
const logger = require('./logger')

const queries = []

const getQuery = (name) => {
  return queries.find((query) => name === query.name)
}

const loadQueries = () => {
  fs.readdir('queries', (error, files) => {
    if (error) {
      logger.error({ message: 'Could not read queries directory', error: error })
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        let data = []

        const readStream = fs.createReadStream(`queries/${file}`)
        readStream.on('data', (chunk) => {
          data.push(chunk)
        })
        readStream.on('end', () => {
          queries.push({
            name: file,
            data: Buffer.concat(data).toString()
          })
        })
        readStream.on('error', (error) => {
          logger.error({ message: `Could not read stream from 'queries/${file}'`, error: error })
        })
      })
    }
  })
}

module.exports = {
  getQuery,
  loadQueries
}