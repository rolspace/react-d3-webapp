import { spawn } from 'child_process'
import webpack from 'webpack'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const task = process.argv[2] || 'dev'

const tasks: Record<string, () => void | Promise<void>> = {
  dev: async () => {
    console.log('Starting development server...')

    // Start webpack in watch mode
    console.log('Starting webpack in watch mode...')
    const devConfig = await import('./webpack/webpack.dev.js')
    const compiler = webpack(devConfig.default)

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error('Webpack error:', err)
        return
      }
      if (stats?.hasErrors()) {
        console.error('Webpack compilation errors:')
        console.error(stats.toString({ colors: true, errors: true }))
      } else {
        console.log('Webpack compiled successfully')
      }
    })

    // Wait a bit for initial webpack compilation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Start backend server
    console.log('Starting backend server...')
    const backend = spawn('tsx', ['index.ts'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    })

    backend.on('error', (err) => {
      console.error('Failed to start backend:', err)
      process.exit(1)
    })

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down development server...')
      backend.kill()
      process.exit(0)
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  },

  build: async () => {
    console.log('Building production bundle...')

    // Build frontend
    console.log('Building frontend...')
    const prodConfig = await import('./webpack/webpack.prod.js')
    const compiler = webpack(prodConfig.default)

    await new Promise<void>((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          console.error('Webpack error:', err)
          reject(err)
          return
        }

        if (stats?.hasErrors()) {
          console.error('Webpack compilation errors:')
          console.error(stats.toString({ colors: true }))
          reject(new Error('Webpack compilation failed'))
          return
        }

        console.log(stats?.toString({ colors: true, chunks: false }))
        console.log('Frontend built successfully!')

        compiler.close((closeErr) => {
          if (closeErr) {
            console.error('Error closing compiler:', closeErr)
            reject(closeErr)
          } else {
            resolve()
          }
        })
      })
    })

    // Build backend
    console.log('Building backend...')
    const tsc = spawn('tsc', ['-p', 'tsconfig.backend.json'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    })

    await new Promise<void>((resolve, reject) => {
      tsc.on('close', (code) => {
        if (code === 0) {
          console.log('Backend built successfully!')
          resolve()
        } else {
          console.error(`Backend build failed with code ${code}`)
          reject(new Error('Backend build failed'))
        }
      })

      tsc.on('error', (err) => {
        console.error('Failed to run tsc:', err)
        reject(err)
      })
    })

    console.log('Build complete!')
  },
}

const selectedTask = tasks[task]
if (selectedTask) {
  const result = selectedTask()
  if (result instanceof Promise) {
    result.catch((err: Error) => {
      console.error('Task failed:', err)
      process.exit(1)
    })
  }
} else {
  console.error(`Unknown task: ${task}`)
  console.error('Available tasks:', Object.keys(tasks).join(', '))
  process.exit(1)
}
