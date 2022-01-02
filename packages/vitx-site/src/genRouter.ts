import { PluginOption } from 'vite'
import path from 'path'

import type { IVitxSiteConfig } from './types'

export type IDocuments = { name: string; path: string }[]

function createVueRoute() {
  return `export default documents`
}

function createReactRoute(lazy: boolean, isDemos: boolean) {
  return `function BuiltRouter(props) {
    const { fallback = React.createElement('div', null), site: BuiltSite } = props
    const document = Object.keys(documents)
    return React.createElement(
      ${lazy ? 'Suspense, { fallback }' : 'Fragment, null'},
      React.createElement(BrowserRouter, ${
        isDemos ? `{ basename: '/mobile.html' }` : 'null'
      }, React.createElement(
          BuiltSite || Fragment, null, React.createElement(
            Routes, null,
            document.map((routeName) => {
              const Element = documents[routeName]
              if (routeName === 'BuiltMobileHome'){
                routeName = ''
              }
              return React.createElement(Route, {
                key: routeName,
                path: \`/\${routeName}\`,
                element: React.createElement(Element, null)
              })
            })
          )
        )
      )
    )
  }
  export default BuiltRouter`
}

export function genRoute(options: {
  documents: IDocuments
  demos: IDocuments
  isReact: boolean
  isVue: boolean
  lazy: boolean
  nav: IVitxSiteConfig['site']['nav']
}): PluginOption {
  const { documents, isVue, isReact, lazy, demos, nav } = options
  const virtualDesktopModuleId = '@vitx-documents-desktop'
  const virtualMobileModuleId = '@vitx-documents-mobile'
  const resolvedMobileVirtualModuleId = `vitx:${virtualMobileModuleId}`
  const resolvedDesktopVirtualModuleId = `vitx:${virtualDesktopModuleId}`

  demos.push({
    name: 'BuiltMobileHome',
    path: path.join(__dirname, '..', 'template/common/element/BuiltMobileHome.jsx')
  })

  const files = {
    [resolvedMobileVirtualModuleId]: demos,
    [resolvedDesktopVirtualModuleId]: documents
  }

  return {
    name: 'vite-plugin-vitx-route',
    resolveId(id) {
      if (id === virtualDesktopModuleId) {
        return resolvedDesktopVirtualModuleId
      }

      if (id === virtualMobileModuleId) {
        return resolvedMobileVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedDesktopVirtualModuleId || id === resolvedMobileVirtualModuleId) {
        const isDemos = id === resolvedMobileVirtualModuleId
        return `
        ${files[id].reduce(
          (memo, current) => {
            if (lazy) {
              isVue && (memo += `const ${current.name} = () => import("${current.path}");\n`)
              isReact &&
                (memo += `const ${current.name} = lazy(() => import("${current.path}"));\n`)
            } else {
              memo += `import ${current.name} from "${current.path}";\n`
            }
            return memo
          },
          isReact
            ? `
            import { Route, Routes, BrowserRouter } from 'react-router-dom'
            import React, { Suspense, lazy, Fragment } from 'react'
            `
            : ''
        )}
        const documents = {
          ${files[id].map((item) => item.name).join(',')}
        }
        export const nav = ${JSON.stringify(nav)}
        ${isReact ? createReactRoute(lazy, isDemos) : createVueRoute()}`
      }
    }
  }
}