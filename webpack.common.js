const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')
const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        use: ['url-loader']
      },
      {
        test: /\.(html)$/,
        use: ['html-loader']
      },
      {
        test: /\.js$/,
        loader: 'ify-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/client/index.html'),
      // title: fs.readdirSync(path.join(__dirname, 'builds')).length
    }),
    new webpack.ProgressPlugin()
  ]
}