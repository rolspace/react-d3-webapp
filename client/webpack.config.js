/* eslint-disable global-require */

const path = require('path');
const Dotenv = require('dotenv-webpack');
const pkg = require('./package.json');
const webpack = require('webpack');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

const babelConfig = Object.assign({}, pkg.babel, {
	babelrc: false
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
		filename: isDev ? '[name].js' : '[name].js',
		chunkFilename: isDev ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
		sourcePrefix: '  ',
	},
	optimization: {
		minimize: !isDev
	},
	
	devtool: isDev ? 'source-map' : false,
  
	stats: {
		colors: true,
		reasons: isDev,
		hash: isVerbose,
		version: isVerbose,
		timings: true,
		chunks: isVerbose,
		chunkModules: isVerbose,
		cached: isVerbose,
		cachedAssets: isVerbose,
	},
  
	plugins: [
		new Dotenv(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
			__DEV__: isDev,
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
						sourceMap: isDev,
						modules: true,
						localIdentName: isDev ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
						minimize: !isDev,
					})}`,
					'postcss-loader',
				],
			}
		]
	}
};

if (!isDev) {
	config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

module.exports = config;