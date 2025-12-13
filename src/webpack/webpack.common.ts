import path from 'path'
import { fileURLToPath } from 'url'
import { Configuration } from 'webpack'
import ESLintPlugin from 'eslint-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: Configuration = {
  entry: path.resolve(__dirname, '../frontend/main.tsx'),
  output: {
    path: path.resolve(__dirname, '../public/dist'),
    filename: 'main.js',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, '../tsconfig.frontend.json'),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['ts', 'tsx'],
      failOnError: true,
      failOnWarning: false,
    }),
  ],
}

export default config
