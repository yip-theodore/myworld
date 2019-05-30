const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const common = require('./webpack.common.js');
const webpackMerge = require('webpack-merge')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

// save current index.js in /saved
const savedLocation = path.join(__dirname, 'src/client/saved')
const savedFolder = fs.readdirSync(savedLocation)

const currentLocation = path.join(__dirname, 'src/client/app.js')

const newName = savedFolder.length + 1
const newLocation = path.join(savedLocation, `${newName}.js`)
fs.copyFileSync(currentLocation, newLocation)

// then build it into /builds
module.exports = webpackMerge(common, {
  mode: 'production',
  entry: currentLocation,//newLocation,
  output: {
    path: path.join(__dirname, 'builds', newName.toString())
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
