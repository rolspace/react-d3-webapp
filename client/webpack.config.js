/* eslint-disable global-require */

const path = require('path');
const Dotenv = require('dotenv-webpack');
const pkg = require('./package.json');
const webpack = require('webpack');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('production');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

const useHMR = !!global.HMR;
const babelConfig = Object.assign({}, pkg.babel, {
	babelrc: false,
	cacheDirectory: useHMR,
});

const config = {
  mode: 'none',
	context: __dirname,
	entry: [
		'webpack-hot-middleware/client',
		'whatwg-fetch',
		'./main.js',
	],
	output: {
		path: path.resolve(__dirname, './public/dist'),
		publicPath: '/dist/',
		filename: isDebug ? '[name].js' : '[name].js',
		chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
		sourcePrefix: '  ',
	},

	devtool: isDebug ? 'source-map' : false,

	stats: {
		colors: true,
		reasons: isDebug,
		hash: isVerbose,
		version: isVerbose,
		timings: true,
		chunks: isVerbose,
		chunkModules: isVerbose,
		cached: isVerbose,
		cachedAssets: isVerbose,
	},

	plugins: [
		new Dotenv({
			path: isDebug ? './.env' : './.env-live'
		}),
		new webpack.LoaderOptionsPlugin({
			debug: isDebug
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
			__DEV__: isDebug,
		})
	],

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				enforce: 'pre',
				loader: 'eslint-loader',
				options: { failOnError: true },
				include: [
					path.resolve(__dirname, './actions'),
					path.resolve(__dirname, './common'),
					path.resolve(__dirname, './components'),
					path.resolve(__dirname, './containers'),
					path.resolve(__dirname, './pages'),
					path.resolve(__dirname, './reducers'),
					path.resolve(__dirname, './main.js')
				],
				exclude: /node_modules/
			},
			{
				test: /\.jsx?$/,
				include: [
					path.resolve(__dirname, './actions'),
					path.resolve(__dirname, './common'),
					path.resolve(__dirname, './components'),
					path.resolve(__dirname, './containers'),
					path.resolve(__dirname, './pages'),
					path.resolve(__dirname, './reducers'),
					path.resolve(__dirname, './main.js')
				],
				use: [`babel-loader?${ JSON.stringify(babelConfig) }`]
			},
			{
				test: /\.css/,
				use: [
					'style-loader',
					`css-loader?${JSON.stringify({
						sourceMap: isDebug,
						modules: true,
						localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
						minimize: !isDebug,
					})}`,
					'postcss-loader',
				],
			}
		]
	}
};

// Optimize the bundle in release (production) mode
if (!isDebug) {
	config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: isVerbose } }));
	config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

module.exports = config;