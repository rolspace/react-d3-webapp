import cookieParser from 'cookie-parser'
import express, { Express } from 'express'
import session from 'express-session'
import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './lib/config.js'
import { logger } from './lib/logger.js'
import { handleOAuthCallback } from './lib/oauth.js'
import { generatePKCEChallenge, storeCodeVerifier } from './lib/pkce.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import * as repoRoute from './routes/repo.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app: Express = express()

if (!process.env.SESSION_SECRET) {
  logger.error('SESSION_SECRET is not set in environment variables')
  throw new Error('SESSION_SECRET environment variable is required')
}

// Disable x-powered-by header for security
app.disable('x-powered-by')

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)
app.use(requestLogger)

// Serve static files from public directory
// In dev mode: __dirname is /path/to/src/bff/backend
// In prod mode: __dirname is /path/to/src/bff/dist/backend
const publicPath = __dirname.includes('/dist/backend')
  ? path.join(__dirname, '../../public')
  : path.join(__dirname, '../public')
app.use(express.static(publicPath))

// API Routes

// Login Route
app.get('/login', (req, res) => {
  try {
    const pkce = generatePKCEChallenge()
    const state = crypto.randomUUID()

    // This is temporary, will change it after initial validation
    storeCodeVerifier(state, pkce.codeVerifier)

    const authUrl = new URL('https://github.com/login/oauth/authorize')
    authUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID || '')
    authUrl.searchParams.set('redirect_uri', process.env.REDIRECT_URI || '')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('code_challenge', pkce.codeChallenge)
    authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod)

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
    })

    res.redirect(authUrl.toString())
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate OAuth flow' })
  }
})

// OAuth Callback Route
app.get('/auth/github/callback', async (req, res, next) => {
  try {
    const { query: { code, state } } = req

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      return res.status(400).json({ error: 'Missing code or state parameter' })
    }

    // Validate state from cookie
    const { cookies: { oauth_state: storedState } } = req
    if (storedState !== state) {
      return res.status(400).json({ error: 'Invalid state parameter' })
    }

    // Exchange code for token using PKCE
    const tokenData = await handleOAuthCallback(code, state)

    if (!tokenData) {
      return res.status(400).json({ error: 'Failed to obtain access token' })
    }

    res.clearCookie('oauth_state')

    // Store the access token in session
    const { access_token: accessToken } = tokenData
    req.session.accessToken = accessToken

    res.redirect('/home')
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'OAuth callback failed',
    })
  }
})

// SPA fallback - serve index.html for all other routes
app.use((req, res, next) => {
  // Don't serve index.html for API or auth routes
  if (req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/dist')) {
    return next()
  }

  const indexPath = path.join(publicPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('index.html not found')
  }
})

// Error handling middleware
app.use(errorHandler)

// Server initialization
export const init = () => {
  try {
    const { httpsCertPath } = config
    const { httpsKeyPath } = config

    if (!fs.existsSync(httpsCertPath) || !fs.existsSync(httpsKeyPath)) {
      logger.error('SSL certificates not found!')
      logger.error(`Looking for cert at: ${httpsCertPath}`)
      logger.error(`Looking for key at: ${httpsKeyPath}`)
      logger.error(
        'Please run: cd backend/certs && ./generate-certs.sh to generate certificates',
      )
      process.exit(1)
    }

    const credentials = {
      cert: fs.readFileSync(httpsCertPath),
      key: fs.readFileSync(httpsKeyPath),
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
