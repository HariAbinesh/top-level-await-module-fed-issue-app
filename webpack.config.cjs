const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const path = require('path');
const deps = require('./package.json').dependencies;

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    devMiddleware: {
      writeToDisk: true
    },
    static: {
      directory: path.join(__dirname, 'dist'),
      
    },
    port: 3001,
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true
  },
  output: {
    publicPath: 'auto',
    module: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      library: { type: 'module', name: 'app1' },
      remotes: {
        app2: 'app2',
      },
      shared: {
        "top-level-await-module-fed-issue": {
          eager: true
        },
        'react-dom': {
          import: 'react-dom', // the "react" package will be used a provided and fallback module
          shareKey: 'react-dom', // under this name the shared module will be placed in the share scope
          shareScope: 'legacy', // share scope with this name will be used
          singleton: true, // only a single version of the shared module is allowed
        },
        // oldReact: {
        //   import: "react", // the "react" package will be used a provided and fallback module
        //   shareKey: "oldReact", // under this name the shared module will be placed in the share scope
        //   shareScope: "legacy", // share scope with this name will be used
        //   singleton: true, // only a single version of the shared module is allowed
        // }
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      app2RemoteEntry: getRemoteEntryUrl(3002),
      scriptLoading: "module"
    }),
  ],
};

module.exports = webpackConfig;

function getRemoteEntryUrl(port) {
  const { CODESANDBOX_SSE, HOSTNAME = '' } = process.env;

  // Check if the example is running on codesandbox
  // https://codesandbox.io/docs/environment
  if (!CODESANDBOX_SSE) {
    return `//localhost:${port}/remoteEntry.js`;
  }

  const parts = HOSTNAME.split('-');
  const codesandboxId = parts[parts.length - 1];

  return `//${codesandboxId}-${port}.sse.codesandbox.io/remoteEntry.js`;
}
