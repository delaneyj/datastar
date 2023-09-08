import { ActionArgs } from '..'
import { addActionExtension, toHTMLorSVGElement } from '../core'
import { idiomorph } from '../external/idiomorph'
import { Reactive } from '../external/reactively'
const p = new DOMParser()
const DATASTAR_CLASS_PREFIX = 'datastar'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}-indicator`
const LOADING_CLASS = `${DATASTAR_CLASS_PREFIX}-request`
const ACCEPT = 'Accept',
  TEXT_HTML = 'text/html',
  CONTENT_TYPE = 'Content-Type',
  APPLICATION_JSON = 'application/json',
  SELECTOR = 'selector',
  SWAP = 'swap'

export const GET = 'get'
export const addGetExtension = () => addFetchMethod(GET)
export const POST = 'post'
export const addPostExtension = () => addFetchMethod(POST)
export const PUT = 'put'
export const addPutExtension = () => addFetchMethod(PUT)
export const PATCH = 'patch'
export const addPatchExtension = () => addFetchMethod(PATCH)
export const DELETE = 'delete'
export const addDeleteExtension = () => addFetchMethod(DELETE)

export const addAllFragmentExtensions = () => {
  addGetExtension()
  addPostExtension()
  addPutExtension()
  addPatchExtension()
  addDeleteExtension()
}

let hasInjectedStyles = false
function addFetchMethod(method: string) {
  if (!hasInjectedStyles) {
    const style = document.createElement('style')
    style.innerHTML = `
.${INDICATOR_CLASS}{
  opacity:0;
  transition: opacity 500ms ease-in;
}
.${LOADING_CLASS} .${INDICATOR_CLASS}{
    opacity:1
}
.${LOADING_CLASS}.${INDICATOR_CLASS}{
    opacity:1
}
    `
    document.head.appendChild(style)
    hasInjectedStyles = true
  }

  addActionExtension({
    name: method,
    description: `turns @${method}(args) into fetch(${method}, args)`,
    fn: async (args: ActionArgs) => fetcher(method, args),
  })
}

async function fetcher(method: string, args: ActionArgs) {
  const { el: elRaw, dataStack } = args

  const urlSignal: Reactive<string> = dataStack.signals?.[method]
  if (!urlSignal) throw new Error(`No signal for ${method}`)

  const el = toHTMLorSVGElement(elRaw)
  if (!el) throw new Error('Element must be an HTMLElement or SVGElement')

  el.classList.add(LOADING_CLASS)

  const url = new URL(urlSignal.value, window.location.origin)

  const headers = new Headers()

  headers.append(ACCEPT, TEXT_HTML)
  headers.append(CONTENT_TYPE, APPLICATION_JSON)

  if (dataStack?.headers) {
    for (let name in dataStack.headers) {
      const signal = dataStack.headers[name]
      headers.append(name, signal.value)
    }
  }

  const dataStackJSON = JSON.stringify(dataStack, (_, value) => {
    if (value instanceof Reactive) {
      if (value.isEffect) return undefined
      return value.get()
    }
    return value
  })
  const req: RequestInit = { method, headers }
  if (method === GET) {
    const queryParams = new URLSearchParams(url.search)
    queryParams.append('dataStack', dataStackJSON)
    url.search = queryParams.toString()
  } else {
    req.body = dataStackJSON
  }

  const res = await fetch(url, req)
  if (!res.ok) throw new Error('Network response was not ok.')
  const html = await res.text()

  const dom = [...p.parseFromString(html, TEXT_HTML).body.children]
  for (let i = 0; i < dom.length; i++) {
    const frag = dom[i]
    if (!(frag instanceof Element)) {
      throw new Error('Not an element')
    }
    const fragElement = toHTMLorSVGElement(frag)

    const id = frag.getAttribute('id')
    const firstFrag = i === 0
    const hasID = !!id?.length
    const useElAsTarget = firstFrag && !hasID

    let targets: Iterable<Element>
    if (useElAsTarget) {
      targets = [elRaw]
    } else {
      if (!hasID) throw new Error('No id')

      const targetSelector = fragElement?.dataset?.[SELECTOR] || `#${id}`
      targets = document.querySelectorAll(targetSelector) || []
    }
    if (!!!targets) throw new Error('No target element')

    for (const target of targets) {
      const merge = fragElement?.dataset?.[SWAP] || 'morph'
      switch (merge) {
        case 'morph':
          idiomorph(target, frag)
          break
        case 'inner':
          target.innerHTML = frag.innerHTML //  The default, replace the inner html of the target element
          break
        case 'outer':
          target.outerHTML = frag.outerHTML //  Replace the entire target element with the response
          break
        case 'prepend':
          target.prepend(frag.outerHTML) //  Insert the response before the first child of the target element
          break
        case 'append':
          target.append(frag.outerHTML) //  Insert the response after the last child of the target element
          break
        case 'before':
          target.before(frag) //  Insert the response before the target element
          break
        case 'after':
          target.after(frag) //  Insert the response after the target element
          break
        case 'delete':
          target.remove() //  Deletes the target element regardless of the response
          break
        default:
          throw new Error('Invalid merge mode')
      }
    }
  }

  el.classList.remove(LOADING_CLASS)
}
