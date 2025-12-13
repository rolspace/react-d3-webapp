import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export interface Config {
  port: number
  nodeEnv: string
  httpsCertPath: string
  httpsKeyPath: string
  apiUrl: string
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  httpsCertPath:
    process.env.HTTPS_CERT_PATH ||
    path.resolve(__dirname, '../certs/cert.pem'),
  httpsKeyPath:
    process.env.HTTPS_KEY_PATH || path.resolve(__dirname, '../certs/key.pem'),
  apiUrl: process.env.API_URL || 'https://localhost:3000',
}
