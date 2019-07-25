const nodeExternals = require('webpack-node-externals')
const merge = require('lodash').merge
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const { NODE_ENV, TARGET_ENV } = process.env
const TARGET_NODE = TARGET_ENV === 'node'
const target = TARGET_NODE ? 'server' : 'client'
const isDev = NODE_ENV && NODE_ENV.indexOf('dev') > -1

module.exports = {
  css: {
    sourceMap: !isDev && !TARGET_NODE
  },
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  configureWebpack: () =>({
    entry: `./src/entry-${target}`,
    target: TARGET_NODE ? 'node' : 'web',
    node: TARGET_NODE ? undefined : false,
    output: {
      libraryTarget: TARGET_NODE ? 'commonjs2' : undefined 
    },
    devtool: 'source-map',
    externals: TARGET_NODE ? nodeExternals({ whitelist: /\.css$/ }) : undefined,
    optimization: {
      splitChunks: TARGET_NODE ? false : undefined
    },
    plugins: [
      TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()
    ],
  }),
  chainWebpack: config => {
    config.module
    .rule('vue')
    .use('vue-loader')
    .tap(options =>
      merge(options, {
        optimizeSSR: false
      })
    )
  }
}
