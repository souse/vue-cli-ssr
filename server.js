const fs = require('fs')
const path = require('path')
const express = require('express')
const proxy = require('http-proxy-middleware')
const { createBundleRenderer } = require('vue-server-renderer')

const devServerBaseURL = process.env.DEV_SERVER_HOST || '127.0.0.1'
const devServerPort = process.env.DEV_SERVER_PORT || 3000

let renderer
const app = express()
const templatePath = path.resolve(__dirname, './src/index.template.html')
const template = fs.readFileSync(templatePath, 'utf-8')
const bundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

function createRenderer (bundle, options) {
  return createBundleRenderer(bundle, Object.assign(options, {
    runInNewContext: false
  }))
}

renderer = createRenderer(bundle, {
  template,
  clientManifest
})

if (process.env.NODE_ENV !== 'production') {
  app.use('/main*', proxy({
    target: `${devServerBaseURL}:${devServerPort}`, 
    changeOrigin: true,
    pathRewrite: function (path) { 
      return path.includes('main')
      ? '/main.js'
      : path
    },
    prependPath: false
  }));

  app.use('/*hot-update*', proxy({
    target: `${devServerBaseURL}:${devServerPort}`, 
    changeOrigin: true,
  }));

  app.use('/sockjs-node', proxy({
    target: `${devServerBaseURL}:${devServerPort}`, 
    changeOrigin: true,
    ws: true
  }));
}

app.use('/js', express.static(path.resolve(__dirname, './dist/js')))
app.use('/img', express.static(path.resolve(__dirname, './dist/img')))
app.use('/css', express.static(path.resolve(__dirname, './dist/css')))

app.get('*', (req, res) => {
  const context = {
    title: 'Vue CLI 3 SSR example',
    url: req.url
  }

  res.setHeader('Content-Type', 'text/html')
  renderer.renderToString(context, (err, html) => {
    if (err) {
      if (err.url) {
        res.redirect(err.url)
      } else {
        res.status(500).end('500 | Internal Server Error')
        console.error(`error during render : ${req.url}`)
        console.error(err.stack)
      }
    }
    res.status(context.HTTPStatus || 200)
    res.send(html)
  })
})

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})