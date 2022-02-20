/* eslint-disable no-console */

const path = require('path')
const http = require('http')
const express = require('express')

const app = express()

const start = () => {
  app.use(express.static(path.join(process.cwd() + '/public')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/index.html'))
  })

  app.use((req, res) => {
    res.status(404).send({ message: 'Resource not found' })
  })

  const port = process.env.PORT || 8000

  app.set('port', port)

  const server = http.createServer(app)
  server.listen(port, () => {
    console.log('Listening on port %s', port)
  })
}

module.exports = {
  start,
}
