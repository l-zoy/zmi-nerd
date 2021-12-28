const vitePluginReact = require('@vitejs/plugin-react')
const vitePluginVue = require('@vitejs/plugin-vue')
const prism = require('markdown-it-prism')
const { createServer } = require('vite')

const Markdown = require('./lib')

const type = process.argv.slice(2)[0]

async function run() {
  const plugin = {
    vue: vitePluginVue,
    react: vitePluginReact
  }

  const server = await createServer({
    root: `./example/${type}`,
    plugins: [
      plugin[type](),
      Markdown({
        markdownItUses: [prism],
        frame: type
      })
    ]
  })

  await server.listen()
  server.printUrls()
}

run()