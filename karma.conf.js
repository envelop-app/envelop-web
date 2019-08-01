const path = require('path');
const webpack = require('webpack');
const WorkerPlugin = require('worker-plugin');

process.env['CHROME_BIN'] = '/usr/bin/chromium-browser';

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    entry: ['babel-polyfill'],
    files: [
      { pattern: 'test/*.js', watched: false }
    ],
    preprocessors: {
      'test/*.js': ['webpack']
    },
    webpack: {
      mode: 'development',
      output: {
        pathinfo: false
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            include: path.resolve(__dirname, 'test'),
            use: ['cache-loader', 'babel-loader']
          }
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          __PREVIEW__: !!process.env.PREVIEW
        }),
        new WorkerPlugin()
      ],
      optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },
    colors: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-translate', '--disable-extensions']
      }
    },
    autoWatch: false,
    singleRun: true,
    concurrency: 5
  });
}
