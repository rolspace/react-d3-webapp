import Dotenv from 'dotenv-webpack'
import { merge } from 'webpack-merge'
import common from './webpack.common.mjs'

const config = {
  mode: 'development',
  devtool: 'source-map',
  stats: {
    reasons: true,
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[name]_[local]_[hash:base64:3]',
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [new Dotenv()],
}

export default merge(common, config)
