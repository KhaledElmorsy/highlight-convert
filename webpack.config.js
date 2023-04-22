const CopyPlugin = require('copy-webpack-plugin');
const { webpack: alias } = require('./aliases');

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    background: { import: './background.js', filename: '[name].js' },
    'content-script': { import: './content-script.js', filename: '[name].js' },
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'inline-cheap-module-source-map', // Avoid 'unsafe-eval' & only inline source maps work with Chrome extensions 
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '../static', to: '' }],
    }),
  ],
  resolve: {
    alias,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
