/*eslint-env node*/
var path = require('path');
var webpack = require('webpack');
module.exports = {
  context: path.join(__dirname, 'js/'),
  entry: './script.js',
  output: {
    filename: 'script.js',
    path: path.join(__dirname, 'public', 'js/')
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      }
    ]
  },
  resolve: {
    root: [path.join(__dirname, 'bower_components')],
    extensions: ['', '.js', '.jsx']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
    ),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ]
};
