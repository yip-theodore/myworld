const webpack = require('webpack')
const common = require('./webpack.common.js');
const webpackMerge = require('webpack-merge')

module.exports = webpackMerge(common, {
  mode: 'development',
  entry: './src/client',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  target: 'web'
})