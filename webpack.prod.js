const path = require('path')
const fs = require('fs')

const common = require('./webpack.common.js');
const webpackMerge = require('webpack-merge')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const prevFolder = fs.readdirSync(path.join(__dirname, 'src/saved'))
const bundle = prevFolder[prevFolder.length - 1]
const [ bundleName ] = bundle.split('.')
console.log('📦 ', bundle)

module.exports = webpackMerge(common, {
  mode: 'production',
  entry: `./src/previous/${bundle}`,
  output: {
    path: path.join(__dirname, 'builds', bundleName)
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin()
  ],
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  }
})