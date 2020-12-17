const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const globImporter = require('node-sass-glob-importer');
const WorkerPlugin = require('worker-plugin');
const CopyPlugin = require("copy-webpack-plugin");

function getPageEntries() {
  // Read all files under /assets/javascripts/pages/* and create
  // a webpack entry point for each one
  const pagesPath = path.join(__dirname, 'assets', 'javascripts', 'pages');
  const pageFilenames = fs.readdirSync(pagesPath)
  const pageEntries = {}
  pageFilenames.forEach(pageFilename => {
    const name = path.basename(pageFilename, '.js');
    const fullPath = path.join(pagesPath, pageFilename);
    pageEntries[name] = [fullPath];
  });
  return pageEntries;
}

module.exports = {
  entry: Object.assign({},
    {
      common: [
        'babel-polyfill',
        path.join(__dirname, 'assets', 'javascripts', 'common.js'),
        path.join(__dirname, 'assets', 'stylesheets', 'common.scss')
      ]
    },
    getPageEntries()
  ),

  output: {
    path: path.join(__dirname, '.tmp', 'dist'),
    filename: 'javascripts/[name].js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'common.css',
            },
          },
          { loader: 'extract-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules'],
              importer: globImporter()
            }
          },
        ]
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __PREVIEW__: !!process.env.PREVIEW
    }),
    new WorkerPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'node_modules', 'streamsaver', 'sw.js'), to: "" },
        { from: path.join(__dirname, 'node_modules', 'streamsaver', 'mitm.html'), to: "" },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    }
  },
};
