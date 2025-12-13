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
  resolve(__dirname, './components'),
  resolve(__dirname, './features'),
  resolve(__dirname, './pages'),
  resolve(__dirname, './services'),
  resolve(__dirname, './store'),
  resolve(__dirname, './types'),
  resolve(__dirname, './main.tsx'),
]

const config = {
  context: __dirname,
  entry: ['./main.tsx'],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
      {
        test: /\.(ts|tsx)$/,
        include,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      failOnError: true,
      failOnWarning: true,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}

export default config
