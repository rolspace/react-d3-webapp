const ESLintPlugin = require('eslint-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const babelConfig = require('./.babelrc.json')

const isVerbose =
  process.argv.includes('--verbose') || process.argv.includes('-v')
const include = [
  path.resolve(__dirname, './app'),
  path.resolve(__dirname, './components'),
  path.resolve(__dirname, './features'),
  path.resolve(__dirname, './lib'),
  path.resolve(__dirname, './pages'),
  path.resolve(__dirname, './main.js'),
]

const config = {
  context: __dirname,
  entry: ['whatwg-fetch', './main.js'],
  resolve: {
    extensions: ['.jsx', '...'],
  },
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
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include,
        use: [`babel-loader?${JSON.stringify(babelConfig)}`],
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      failOnError: true,
      failOnWarning: true,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}

module.exports = config
