import webpack from 'webpack'

const tasks = new Map()

const run = async (task) => {
  try {
    const start = new Date()
    console.log(`Starting '${task}'...`)
    await tasks.get(task)()
    console.log(
      `Finished '${task}' after ${new Date().getTime() - start.getTime()}ms`,
    )
  } catch (err) {
    console.log(err)
  }
}

// Build 'development' using webpack and launch it in a browser for testing
tasks.set('dev', async () => {
  let count = 0

  const { default: browserSync } = (await import('browser-sync'))
  const { default: webpackDevMiddleware } = await import('webpack-dev-middleware')
  const { default: webpackHotMiddleware } = await import('webpack-hot-middleware')
  const { default: connectHistoryApiFallback } = await import('connect-history-api-fallback')
  const webpackConfig = (await import('./webpack.dev.mjs')).default || (await import('./webpack.dev.mjs'))

  return new Promise(resolve => {
    const bs = browserSync.create()
    const compiler = webpack(webpackConfig)

    const devMiddleware = webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: webpackConfig.stats,
    })

    // Launch Browsersync after the initial bundling is complete
    compiler.hooks.done.tap('bsPlugin', () => {
      if (++count === 1) {
        bs.init(
          {
            port: process.env.PORT || 8000,
            ui: { port: Number(process.env.PORT || 8000) + 1 },
            server: {
              baseDir: 'public',
              middleware: [
                devMiddleware,
                webpackHotMiddleware(compiler),
                connectHistoryApiFallback(),
              ],
            },
          },
          resolve,
        )
      }
    })
  })
})

// Bundle JavaScript, CSS and image files with Webpack for 'production'
tasks.set('build', async () => {
  const webpackConfig = (await import('./webpack.prod.mjs')).default || (await import('./webpack.prod.mjs'))

  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((error, stats) => {
      if (error) {
        reject(error)
      } else {
        console.log(stats.toString(webpackConfig.stats))
        resolve()
      }
    })
  })
})

// Execute the specified task or default one. E.g.: node run.mjs build
run(/^\w/.test(process.argv[2] || '') ? process.argv[2] : 'dev')
