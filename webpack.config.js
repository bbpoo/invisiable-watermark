const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production",
  devtool: 'nosources-source-map',
  entry: {
    'ivwatermark': "./src/ivwatermark.ts"
  },
  output: {
    library: 'ivWatermark',
    libraryTarget: 'var',
    libraryExport: 'ivWatermark',
    path: path.resolve(__dirname, './dist'),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        // include: /\.min\.js$/,
        // exclude: /\/ivWatermark/,
      })
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  }
};
