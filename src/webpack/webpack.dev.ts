import { merge } from 'webpack-merge'
import { Configuration } from 'webpack'
import Dotenv from 'dotenv-webpack'
import path from 'path'
import { fileURLToPath } from 'url'
import common from './webpack.common.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: Configuration = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '../.env'),
      safe: false,
      systemvars: true,
    }),
  ],
})

export default config
