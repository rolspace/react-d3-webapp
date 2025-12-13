import https from 'https'
import fs from 'fs'
import path from 'path'
import express, { Express } from 'express'
import { fileURLToPath } from 'url'
import { config } from './lib/config.js'
import { logger } from './lib/logger.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import * as healthRoute from './routes/health.js'
import * as sampleRoute from './routes/sample.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express app
export const app: Express = express()

// Disable x-powered-by header for security
app.disable('x-powered-by')

// Middleware
app.use(express.json())
app.use(requestLogger)

// Serve static files from public directory
// In dev mode: __dirname is /path/to/src/bff/backend
// In prod mode: __dirname is /path/to/src/bff/dist/backend
const publicPath = __dirname.includes('/dist/backend')
  ? path.join(__dirname, '../../public')
  : path.join(__dirname, '../public')
app.use(express.static(publicPath))

// API Routes
app.get('/api/health', (req, res, next) => healthRoute.get(req, res, next))
app.get('/api/sample', (req, res, next) => sampleRoute.get(req, res, next))
app.post('/api/sample', (req, res, next) => sampleRoute.post(req, res, next))

// SPA fallback - serve index.html for all other routes
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/dist')) {
    return next()
  }

  const indexPath = path.join(publicPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('index.html not found')
  }
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Initialize HTTPS server
export const init = () => {
  try {
    // Read SSL certificates
    const certPath = config.httpsCertPath
    const keyPath = config.httpsKeyPath

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      logger.error('SSL certificates not found!')
      logger.error(`Looking for cert at: ${certPath}`)
      logger.error(`Looking for key at: ${keyPath}`)
      logger.error(
        'Please run: cd backend/certs && ./generate-certs.sh to generate certificates',
      )
      process.exit(1)
    }

    const credentials = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    }

    // Create HTTPS server
    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(config.port, () => {
      logger.info(`HTTPS Server running on port ${config.port}`)
      logger.info(`Environment: ${config.nodeEnv}`)
      logger.info(`API URL: ${config.apiUrl}`)
    })

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server...')
      httpsServer.close(() => {
        logger.info('Server shut down successfully')
        process.exit(0)
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } catch (error) {
    logger.error('Failed to start server')
    logger.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
