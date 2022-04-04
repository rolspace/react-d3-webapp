/* eslint-disable global-require */

const path = require('path')
const babelConfig = require('./.babelrc.json')
const webpack = require('webpack')

const isVerbose =
  process.argv.includes('--verbose') || process.argv.includes('-v')
const include = [
  path.resolve(__dirname, './actions'),
  path.resolve(__dirname, './common'),
  path.resolve(__dirname, './components'),
  path.resolve(__dirname, './containers'),
  path.resolve(__dirname, './pages'),
  path.resolve(__dirname, './reducers'),
  path.resolve(__dirname, './main.js'),
]

const config = {
  context: __dirname,
  entry: ['whatwg-fetch', './main.js'],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './public/dist'),
    publicPath: '/dist/',
  },
  stats: {
    colors: true,
    timings: true,
    hash: isVerbose,
    version: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.APPLICATION_ID': JSON.stringify(process.env.APPLICATION_ID),
      'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: { failOnError: true },
        include,
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        include,
        use: [`babel-loader?${JSON.stringify(babelConfig)}`],
      },
    ],
  },
}

module.exports = config
