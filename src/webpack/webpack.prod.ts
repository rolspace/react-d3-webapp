import { merge } from 'webpack-merge'
import webpack, { Configuration } from 'webpack'
import common from './webpack.common.js'

const config: Configuration = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(
        process.env.API_URL || 'https://localhost:3000',
      ),
    }),
  ],
  optimization: {
    minimize: true,
  },
})

export default config
