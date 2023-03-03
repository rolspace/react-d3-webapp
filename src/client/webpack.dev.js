/* eslint-disable global-require */
const Dotenv = require('dotenv-webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

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
          `css-loader?${JSON.stringify({
            sourceMap: true,
            modules: true,
            localIdentName: '[name]_[local]_[hash:base64:3]',
            minimize: false,
          })}`,
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [new Dotenv()],
}

module.exports = merge(common, config)
