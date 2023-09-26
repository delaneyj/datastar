import { toHTMLorSVGElement } from '..'
import { idiomorph } from '../external/idiomorph'
import { Signal } from '../external/preact-core'
import { Actions, AttributeContext, AttributePlugin } from '../types'

const GET = 'get'
const POST = 'post'
const PUT = 'put'
const PATCH = 'patch'
const DELETE = 'delete'
const Methods = [GET, POST, PUT, PATCH, DELETE]

export const BackendActions: Actions = Methods.reduce((acc, method) => {
  acc[method] = async (ctx) => fetcher(method, ctx)
  return acc
}, {} as Actions)

const ACCEPT = 'Accept'
const CONTENT_TYPE = 'Content-Type'
const APPLICATION_JSON = 'application/json'
const DATASTAR_CLASS_PREFIX = 'datastar'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}-indicator`
const LOADING_CLASS = `${DATASTAR_CLASS_PREFIX}-request`
const TEXT_HTML = 'text/html'
const SELECTOR = 'selector'
const SWAP = 'swap'

// type Method = typeof GET | typeof POST | typeof PUT | typeof PATCH | typeof DELETE

export const HeadersPlugin: AttributePlugin = {
  prefix: 'header',
  description: 'Sets the header of the fetch request',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx) => {
    const headers = ctx.store.fetch.headers
    const key = ctx.key[0].toUpperCase() + ctx.key.slice(1)
    headers[key] = ctx.reactivity.computed(() => ctx.expressionFn(ctx))
    return () => {
      delete headers[key]
    }
  },
}

export const FetchURLPlugin: AttributePlugin = {
  prefix: 'fetchUrl',
  description: 'Sets the fetch url',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  onGlobalInit: ({ mergeStore }) => {
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
    const h = new Headers()
    h.append(ACCEPT, TEXT_HTML)
    h.append(CONTENT_TYPE, APPLICATION_JSON)
    mergeStore({
      fetch: {
        headers: {},
        elementURLs: {},
      },
    })
  },
  onLoad: (ctx) => {
    return ctx.reactivity.effect(() => {
      const c = ctx.reactivity.computed(() => `${ctx.expressionFn(ctx)}`)
      ctx.store.fetch.elementURLs[ctx.el.id] = c
      return () => {
        delete ctx.store.fetch.elementURLs[ctx.el.id]
      }
    })
  },
}

export const ServerSentEventsPlugin: AttributePlugin = {
  prefix: 'sse',
  description: 'Sets the value of the element',
  mustHaveEmptyKey: true,
  onLoad: (ctx) => {
    const url = ctx.expressionFn(ctx)
    if (typeof url !== 'string') throw new Error('SSE url must be a string')

    const eventSource = new EventSource(url)

    const callback = (evt: MessageEvent) => {
      mergeHTMLFragments(ctx, evt.data, 'append')
    }
    eventSource.addEventListener('message', callback)

    const errCallback = (evt: Event) => console.error(evt)
    eventSource.addEventListener('error', errCallback)

    return () => {
      eventSource.removeEventListener('message', callback)
      eventSource.removeEventListener('error', errCallback)
      eventSource.close()
    }
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchURLPlugin, ServerSentEventsPlugin]

async function fetcher(method: string, ctx: AttributeContext) {
  const { el, store } = ctx
  const urlSignal: Signal<string> = store.fetch.elementURLs[el.id]
  if (!urlSignal) throw new Error(`No signal for ${method}`)

  el.classList.add(LOADING_CLASS)

  const url = new URL(urlSignal.value, window.location.origin)

  const headers = new Headers()
  headers.append(ACCEPT, TEXT_HTML)
  headers.append(CONTENT_TYPE, APPLICATION_JSON)

  const storeHeaders: Record<string, string> = store.fetch.headers.value
  if (storeHeaders) {
    for (const key in storeHeaders) {
      const value = storeHeaders[key]
      headers.append(key, value)
    }
  }

  const storeWithoutFetch = { ...store }
  delete storeWithoutFetch.fetch
  const storeJSON = JSON.stringify(storeWithoutFetch)
  const req: RequestInit = { method, headers }
  if (method === GET) {
    const queryParams = new URLSearchParams(url.search)
    queryParams.append('datastar', storeJSON)
    url.search = queryParams.toString()
  } else {
    req.body = storeJSON
  }

  const res = await fetch(url, req)
  if (!res.ok) throw new Error('Network response was not ok.')
  const text = await res.text()

  const isRedirect = res.status >= 300 && res.status < 40
  if (isRedirect) {
    let url = text
    if (url.startsWith('/')) url = window.location.origin + url
    Response.redirect(url)
  }

  const isHTML = res.headers.get(CONTENT_TYPE) === TEXT_HTML
  if (!isHTML) throw new Error(`Response is not HTML, can't merge`)
  mergeHTMLFragments(ctx, text)

  el.classList.remove(LOADING_CLASS)
}

const p = new DOMParser()
export function mergeHTMLFragments(ctx: AttributeContext, html: string, merge = 'morph') {
  const { el } = ctx
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
      targets = [el]
    } else {
      if (!hasID) throw new Error('No id')

      const targetSelector = fragElement?.dataset?.[SELECTOR] || `#${id}`
      targets = document.querySelectorAll(targetSelector) || []
    }
    if (!!!targets) throw new Error('No target element')

    for (const target of targets) {
      const swap = fragElement?.dataset?.[SWAP]
      if (swap) merge = swap

      switch (merge) {
        case 'morph':
          idiomorph(target, frag)
          ctx.applyPlugins(target)
          continue
        case 'inner':
          target.innerHTML = frag.innerHTML //  The default, replace the inner html of the target element
          break
        case 'outer':
          target.outerHTML = frag.outerHTML //  Replace the entire target element with the response
          break
        case 'prepend':
          target.prepend(frag) //  Insert the response before the first child of the target element
          break
        case 'append':
          target.append(frag) //  Insert the response after the last child of the target element
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
      ctx.applyPlugins(frag)
    }
  }
}
