import morphdom from 'morphdom'
import { SIGNAL, functionEval } from '..'
import { WithExpressionArgs, addDataExtension, toHTMLorSVGElement } from '../core'

const p = new DOMParser(),
  LOADING_CLASS = 'datastar-loading',
  TEXT_HTML = 'text/html',
  REPLACE = 'replace',
  APPEND_CHILD = 'appendChild',
  MORPH = 'morph'

export const HEADER = Symbol('header')
export function addHeadersExtension() {
  addDataExtension(HEADER, {
    requiredExtensions: [SIGNAL],
    withExpression: ({ name, expression, dataStack, reactivity: { computed } }) => {
      const headers = functionEval(dataStack, expression)
      if (typeof headers !== 'object') {
        throw new Error('Headers must be an object')
      }

      return {
        headers: {
          [name]: computed(() => headers),
        },
      }
    },
  })
}

export const GET = Symbol('get')
export const addGetExtension = () => addFetchMethod(GET)
export const POST = Symbol('post')
export const addPostExtension = () => addFetchMethod(POST)
export const PUT = Symbol('put')
export const addPutExtension = () => addFetchMethod(PUT)
export const PATCH = Symbol('patch')
export const addPatchExtension = () => addFetchMethod(PATCH)
export const DELETE = Symbol('delete')
export const addDeleteExtension = () => addFetchMethod(DELETE)

export const addAllFragmentExtensions = () => {
  addGetExtension()
  addPostExtension()
  addPutExtension()
  addPatchExtension()
  addDeleteExtension()
}

function addFetchMethod(method: Symbol) {
  addDataExtension(method, {
    requiredExtensions: [SIGNAL],
    withExpression: (args) => fetcher(method, args),
  })
}

function fetcher(methodSymbol: Symbol, args: WithExpressionArgs) {
  const {
    el: elRaw,
    dataStack,
    expression,
    reactivity: { computed },
  } = args

  computed(async () => {
    const urlRaw = functionEval(dataStack, expression)
    if (urlRaw !== 'string') throw new Error('url must be a string')

    const el = toHTMLorSVGElement(elRaw)
    if (!el) throw new Error('Element must be an HTMLElement or SVGElement')

    el.classList.add(LOADING_CLASS)

    const url = new URL(urlRaw)
    const headers = new Headers()
    headers.append('Accept', TEXT_HTML)
    headers.append('Content-Type', 'application/json')

    if (dataStack?.headers) {
      for (let name in dataStack.headers) {
        const signal = dataStack.headers[name]
        headers.append(name, signal.value)
      }
    }

    const method = methodSymbol.toString().toUpperCase()
    const req: RequestInit = { method, headers }
    const dataStackJSON = JSON.stringify(dataStack)
    if (methodSymbol !== GET) {
      const b64 = atob(dataStackJSON)
      url.searchParams.append('dataStack', b64)
    } else {
      req.body = dataStackJSON
    }

    const res = await fetch(url, req)
    if (!res.ok) throw new Error('Network response was not ok.')
    const html = await res.text()

    const dom = p.parseFromString(html, TEXT_HTML).body.childNodes
    for (const frag of dom) {
      if (!(frag instanceof Element)) throw new Error('Not an element')

      const id = frag.getAttribute('id')
      if (!id) throw new Error('No id')

      const fragElement = toHTMLorSVGElement(frag)

      const targetSelector = fragElement?.dataset?.[`fragmentTargetSelector`] || `#${id}`

      const target = targetSelector ? document.querySelector(targetSelector) : elRaw
      if (!target) throw new Error('No target element')

      const merge = fragElement?.dataset?.[`fragmentMergeMode`] || MORPH
      switch (merge) {
        case REPLACE:
          el.replaceWith(frag)
          break
        case APPEND_CHILD:
          el.appendChild(frag)
          break
        case MORPH:
          morphdom(target, frag)
          break
        default:
          throw new Error('Invalid merge mode')
      }
    }

    el.classList.remove(LOADING_CLASS)
  })
}
