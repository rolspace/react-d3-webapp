/* eslint-disable no-console, global-require */

const fs = require('fs')
const del = require('del')
const webpack = require('webpack')
const server = require('./server')

const tasks = new Map()

async function run(task) {
	try {
		const start = new Date()
		console.log(`Starting '${task}'...`)
		await tasks.get(task)()
		console.log(`Finished '${task}' after ${new Date().getTime() - start.getTime()}ms`)
	}
	catch (err) {
		console.log(err)
	}
}

tasks.set('clean', async () => {
	await del(['public/dist/*', '!public/dist/.git'], { dot: true })
})

// Bundle JavaScript, CSS and image files with Webpack
tasks.set('bundle', async () => {
	const webpackConfig = require('./webpack.config')
	return new Promise((resolve, reject) => {
		webpack(webpackConfig).run((error, stats) => {
			if (error) {
				reject(error)
			}
			else {
				console.log(stats.toString(webpackConfig.stats))
				resolve()
			}
		})
	})
})

// Build website into a distributable format
tasks.set('build', async () => {
	await run('clean')
	await run('bundle')
})

// Build website using webpack and launch it in a browser for testing (default)
tasks.set('dev', async () => {
	process.env.NODE_ENV = 'development'

	let count = 0

	await run('clean')

	return new Promise(resolve => {
		const bs = require('browser-sync').create()
		const webpackConfig = require('./webpack.config')
		const compiler = webpack(webpackConfig)

		const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
			publicPath: webpackConfig.output.publicPath,
			stats: webpackConfig.stats,
		})

		// Launch Browsersync after the initial bundling is complete
		compiler.hooks.done.tap('bsPlugin', () => {
			if (++count === 1) {
				bs.init({
					port: process.env.PORT || 8000,
					ui: { port: Number(process.env.PORT || 8000) + 1 },
					server: {
						baseDir: 'public',
						middleware: [
							webpackDevMiddleware,
							require('webpack-hot-middleware')(compiler),
							require('connect-history-api-fallback')(),
						],
					},
				}, resolve)
			}
		})
	})
})

// Build website and start the Express server
tasks.set('pro', async () => {
	process.env.NODE_ENV = 'production'

	const buildFile = 'public/dist/main.js'

	return new Promise((resolve, reject) => {
		fs.access(buildFile, fs.constants.R_OK, (error) => {
			if (error) {
				reject(error)
			}
			else {
				server.start()
				resolve()
			}
		})
	})
})

// Execute the specified task or default one. E.g.: node run build
run(/^\w/.test(process.argv[2] || '') ? process.argv[2] : 'dev')
