/* eslint-disable global-require */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const config = {
    mode: 'production',
    devtool: 'source-map',
    output: {
        clean: true,
    },
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
        ]
    }
}

module.exports = merge(common, config)
