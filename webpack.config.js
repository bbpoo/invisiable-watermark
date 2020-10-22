const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [{
  mode: "production",
  devtool: 'nosources-source-map',
  entry: {
    'ivwatermark': "./src/ivwatermark.ts"
  },
  output: {
    library: 'IvWatermark',
    libraryTarget: 'var',
    libraryExport: 'IvWatermark',
    path: path.resolve(__dirname, './dist'),
    filename: "[name]-js.js",
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
        // exclude: /\/IvWatermark/,
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
}, {
  mode: "development",
  devtool: false,
  entry: {
    'ivwatermark': "./src/ivwatermark.ts"
  },
  output: {
    library: 'IvWatermark',
    libraryTarget: 'commonjs',
    libraryExport: 'IvWatermark',
    path: path.resolve(__dirname, './dist'),
    filename: "[name]-commonjs.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
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
}];
