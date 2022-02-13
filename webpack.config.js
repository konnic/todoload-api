const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin-next');

const isProd = process.env.NODE_ENV === 'production';
const env = process.env.NODE_ENV;

module.exports = {
  mode: env,
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: isProd ? '[name].[contenthash].js' : 'main.js',
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'inline-source-map',
  target: 'node',

  // Reload on file changes
  watch: !isProd,

  // Exclude deps from bundle, expects deps to be present in environment
  externals: [nodeExternals()],
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: {
        scripts: isProd ? [] : ['npm run start:dev', 'npm run mongo:dev'],
        blocking: false,
        parallel: true,
      },
    }),
  ],
};
