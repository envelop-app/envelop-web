const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const globImporter = require('node-sass-glob-importer');

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
    filename: 'javascripts/[name].js'
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
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env'],
        },
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    }
  }
};
