import { toHTMLorSVGElement } from '../dom'
import { idiomorph } from '../external/idiomorph'
import { Signal } from '../external/preact-core'
import { Actions, AttributeContext, AttributePlugin, OnRemovalFn } from '../types'

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

export const FetchHeaders: AttributePlugin = {
  prefix: 'header',
  description: 'Sets the fetch headers',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  onLoad: (ctx) => {
    ctx.reactivity.effect(() => {
      const key = ctx.key
      const value = ctx.expressionFn(ctx)

      if (!('headers' in ctx.store)) {
        ctx.store.headers = ctx.reactivity.signal(new Headers())
      }

      const headers = ctx.store.headers.value
      headers.value.set(key, value)

      ctx.store.headers.value = headers
    })
  },
}

const ACCEPT = 'Accept'
const CONTENT_TYPE = 'Content-Type'
const APPLICATION_JSON = 'application/json'
const DATASTAR_CLASS_PREFIX = 'datastar'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}-indicator`
const LOADING_CLASS = `${DATASTAR_CLASS_PREFIX}-request`

async function fetcher(method: string, ctx: AttributeContext) {
  const { el, store } = ctx
  const urlSignal: Signal<string> = store.url?.[method]
  if (!urlSignal) throw new Error(`No signal for ${method}`)

  el.classList.add(LOADING_CLASS)

  const url = new URL(urlSignal.value, window.location.origin)

  const headers = new Headers()
  headers.append(ACCEPT, TEXT_HTML)
  headers.append(CONTENT_TYPE, APPLICATION_JSON)

  const storeHeaders = store?.headers?.value as Headers
  if (storeHeaders) {
    storeHeaders.forEach((value, name) => {
      headers.append(name, value)
    })
  }

  const storeJSON = JSON.stringify(store, (_, value) => {
    if (value instanceof Signal) {
      return value.toJSON()
    }
    return value
  })
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
  const html = await res.text()

  mergeHTMLFragments(ctx, html)

  el.classList.remove(LOADING_CLASS)
}

// type Method = typeof GET | typeof POST | typeof PUT | typeof PATCH | typeof DELETE

export const FetchURL: AttributePlugin = {
  prefix: 'url',
  description: 'Sets the fetch url',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  allowedModifiers: new Set([GET, POST, PUT, PATCH, DELETE]),
  onLoad: (ctx) => {
    ctx.reactivity.effect(() => {
      const url = ctx.expressionFn(ctx)
      ctx.store.url = ctx.reactivity.signal(url)
    })
  },
  onGlobalInit: () => {
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
  },
}

export const ServerSentEventsPlugin: AttributePlugin = {
  prefix: 'sse',
  description: 'Sets the value of the element',
  mustHaveEmptyKey: true,
  onLoad: (ctx) => {
    const cleanups: OnRemovalFn[] = []
    const cleanup = () => {
      cleanups.forEach((fn) => fn?.())
      cleanups.length = 0
    }

    const dispose = ctx.reactivity.effect(() => {
      cleanup()

      const url = ctx.expressionFn(ctx)
      if (typeof url !== 'string') throw new Error('SSE url must be a string')

      const eventSource = new EventSource(url)
      const callback = (evt: MessageEvent) => {
        mergeHTMLFragments(ctx, evt.data)
      }

      const errCallback = (evt: Event) => console.error(evt)

      eventSource.addEventListener('message', callback)
      eventSource.addEventListener('error', errCallback)

      cleanups.push(() => {
        eventSource.removeEventListener('message', callback)
        eventSource.removeEventListener('error', errCallback)
        eventSource.close()
      })
    })
    if (dispose) cleanups.push(dispose)

    return cleanup
  },
}

export const BackendPlugins: AttributePlugin[] = [FetchHeaders, ServerSentEventsPlugin]

const TEXT_HTML = 'text/html'
const SELECTOR = 'selector'
const SWAP = 'swap'

const p = new DOMParser()
export function mergeHTMLFragments(ctx: AttributeContext, html: string) {
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
      ctx.applyPlugins(target)
    }
  }
}
