const fs = require('fs')

const queries = []

const getQuery = (name) => {
  return queries.find((query) => name === query.name)
}

const initializeQueries = () => {
  fs.readdir('queries', (err, files) => {
    if (err) {
      console.log(err)
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        let data = []

        const readStream = fs.createReadStream(`queries/${file}`)
        readStream.on('data', (chunk) => {
          data.push(chunk)
        })
        readStream.on('end', (chunk) => {
          queries.push({
            name: file,
            data: Buffer.concat(data).toString()
          })
        })
      })
    }
  })
}

module.exports = {
  getQuery,
  initializeQueries
}