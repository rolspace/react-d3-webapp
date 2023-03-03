/* eslint-disable global-require */
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const config = {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          `css-loader?${JSON.stringify({
            sourceMap: false,
            modules: true,
            localIdentName: '[name]_[local]_[hash:base64:3]',
            minimize: true,
          })}`,
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APPLICATION_ID': JSON.stringify(process.env.APPLICATION_ID),
      'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL),
    }),
  ],
}

module.exports = merge(common, config)
