/* eslint-disable no-console, global-require */

const del = require('del')
const webpack = require('webpack')
const express = require('./server/app')

const tasks = new Map()

function run(task) {
	const start = new Date()
	console.log(`Starting '${task}'...`)
	return Promise.resolve().then(() => tasks.get(task)()).then(() => {
		console.log(`Finished '${task}' after ${new Date().getTime() - start.getTime()}ms`)
	}, err => console.error(err.stack))
}

tasks.set('clean', () => del(['public/dist/*', '!public/dist/.git'], { dot: true }))

// Bundle JavaScript, CSS and image files with Webpack
tasks.set('bundle', () => {
	const webpackConfig = require('./webpack.config')
	return new Promise((resolve, reject) => {
		webpack(webpackConfig).run((err, stats) => {
			if (err) {
				reject(err)
			} else {
				console.log(stats.toString(webpackConfig.stats))
				resolve()
			}
		})
	})
})

// Build website into a distributable format
tasks.set('build', () => {
	global.DEBUG = process.argv.includes('--debug') || false
	return Promise.resolve()
	.then(() => run('clean'))
	.then(() => run('bundle'))
})

// Build website and launch it in a browser for testing (default)
tasks.set('dev', () => {
	let count = 0
	global.HMR = !process.argv.includes('--no-hmr'); // Hot Module Replacement (HMR)
	return run('clean').then(() => new Promise(resolve => {
		const bs = require('browser-sync').create()
		const webpackConfig = require('./webpack.config')
		const compiler = webpack(webpackConfig)

		const webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
			publicPath: webpackConfig.output.publicPath,
			stats: webpackConfig.stats,
		})

		compiler.plugin('done', () => {
			// Launch Browsersync after the initial bundling is complete
			if (++count === 1) {
				bs.init({
					port: process.env.PORT || 3000,
					ui: { port: Number(process.env.PORT || 3000) + 1 },
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
	}))
})

tasks.set('pro', () => {
	return Promise.resolve()
	.then(() => run('clean'))
	.then(() => run('bundle'))
	.then(() => {
		console.log('Production task running')
		express.init()
	})
})

// Execute the specified task or default one. E.g.: node run build
run(/^\w/.test(process.argv[2] || '') ? process.argv[2] : 'dev')
