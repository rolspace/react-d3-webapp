import ESLintPlugin from 'eslint-webpack-plugin'
import webpack from 'webpack'
import babelConfig from './.babelrc.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isVerbose =
  process.argv.includes('--verbose') || process.argv.includes('-v')
const include = [
  resolve(__dirname, './app'),
  resolve(__dirname, './components'),
  resolve(__dirname, './features'),
  resolve(__dirname, './lib'),
  resolve(__dirname, './pages'),
  resolve(__dirname, './main.js'),
]

const config = {
  context: __dirname,
  entry: ['./main.js'],
  resolve: {
    extensions: ['.jsx', '...'],
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, './public/dist'),
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

export default config
