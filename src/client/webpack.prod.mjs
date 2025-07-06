import webpack from 'webpack'
import { merge } from 'webpack-merge'
import common from './webpack.common.mjs'

const config = {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              modules: true,
              localIdentName: '[name]_[local]_[hash:base64:3]',
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APPLICATION_ID': JSON.stringify(process.env.APPLICATION_ID),
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    }),
  ],
}

export default merge(common, config)
