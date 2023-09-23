import { toHTMLorSVGElement } from '../dom'
import { idiomorph } from '../external/idiomorph'
import { ActionPlugin, AttributeContext, AttributePlugin, HTMLorSVGElement } from '../types'

import { Signal, reactivityPlugins } from './reactivity'
import { noArgs } from './shared'

export const SELECTOR = 'selector'
export const SWAP = 'swap'
export const REQ_HEADERS_CTX_KEY = 'reqHeaders'

export class FetchRequestHeadersPlugin extends AttributePlugin {
  name = 'FetchRequestHeaders'
  prefix = 'header'
  description = 'Sets the headers of the fetch request'
  mustHaveEmptyKey = true

  onMount({ key, get, set, expressionEvaluated }: AttributeContext) {
    let headers: Headers | undefined = get(REQ_HEADERS_CTX_KEY)

    if (!headers) {
      headers = new Headers()
    }

    headers.set(key, expressionEvaluated)
    set(REQ_HEADERS_CTX_KEY, headers)
  }
}

export const GET = 'get'
export const POST = 'post'
export const PUT = 'put'
export const PATCH = 'patch'
export const DELETE = 'delete'

const DATASTAR_CLASS_PREFIX = 'datastar'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}-indicator`
const LOADING_CLASS = `${DATASTAR_CLASS_PREFIX}-request`

type Method = typeof GET | typeof POST | typeof PUT | typeof PATCH | typeof DELETE

abstract class FetchAction extends ActionPlugin {
  static hasInjectedStyles = false
  name: string
  description: string

  constructor(public readonly method: Method) {
    super()
    this.name = `Fetch${method}`
    this.description = `fetches fragments from the server using ${method}`
    this.requiredPluginTypes = new Set([FetchRequestHeadersPlugin, ...reactivityPlugins])

    if (!FetchAction.hasInjectedStyles) {
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
      FetchAction.hasInjectedStyles = true
    }
  }

  async action(ctx: AttributeContext) {
    await fetcher(this.method, ctx)
  }
}

export class FetchGetActionPlugin extends FetchAction {
  constructor() {
    super(GET)
  }
}

export class FetchPostActionPlugin extends FetchAction {
  constructor() {
    super(POST)
  }
}

export class FetchPutActionPlugin extends FetchAction {
  constructor() {
    super(PUT)
  }
}

export class FetchPatchActionPlugin extends FetchAction {
  constructor() {
    super(PATCH)
  }
}

export class FetchDeleteActionPlugin extends FetchAction {
  constructor() {
    super(DELETE)
  }
}

export class FetchAttributePlugin extends AttributePlugin {
  name = 'Fetch'
  prefix = 'fetch'
  description = 'URL to fetch from'
  allowedModifiers = new Set([GET, POST, PUT, PATCH, DELETE])
  allowedModifierArgs = {
    [GET]: noArgs,
    [POST]: noArgs,
    [PUT]: noArgs,
    [PATCH]: noArgs,
    [DELETE]: noArgs,
  }
  mustHaveEmptyKey = true

  onMount({ expressionEvaluated, modifiers, set }: AttributeContext): void {
    if (typeof expressionEvaluated !== 'string') throw new Error('expressionEvaluated must be a string')

    if (modifiers.has(POST)) {
      set(POST, expressionEvaluated)
    } else if (modifiers.has(PUT)) {
      set(PUT, expressionEvaluated)
    } else if (modifiers.has(PATCH)) {
      set(PATCH, expressionEvaluated)
    } else if (modifiers.has(DELETE)) {
      set(DELETE, expressionEvaluated)
    } else {
      set(GET, expressionEvaluated)
    }
  }

  onUnmount({ set, modifiers }: AttributeContext): void {
    if (modifiers.has(POST)) {
      set(POST, undefined)
    } else if (modifiers.has(PUT)) {
      set(PUT, undefined)
    } else if (modifiers.has(PATCH)) {
      set(PATCH, undefined)
    } else if (modifiers.has(DELETE)) {
      set(DELETE, undefined)
    } else {
      set(GET, undefined)
    }
  }
}

export class ServerSentEventsAttributePlugin extends AttributePlugin {
  name = 'ServerSentEvents'
  prefix = 'sse'
  description = 'Sets the value of the element'
  mustHaveEmptyKey = true
  eventSources = new Map<HTMLorSVGElement, EventSource>()

  onMount({ el, key, expressionEvaluated, effect, cleanup }: AttributeContext) {
    const isString = typeof expressionEvaluated === 'string'

    const addEventListeners = (eventSource: EventSource) => {
      eventSource.addEventListener('message', (evt) => {
        mergeHTMLFragments(el, evt.data)
      })
      eventSource.addEventListener('error', (evt) => {
        console.error('SSE error', evt)
      })
    }

    if (isString) {
      const eventSource = new EventSource(key)
      addEventListeners(eventSource)
      this.eventSources.set(el, eventSource)
    } else {
      const isSignal = expressionEvaluated instanceof Signal
      if (!isSignal) throw new Error(`Signal ${expressionEvaluated} not found`)

      const eventSource = new EventSource(expressionEvaluated.value)
      effect(() => {
        addEventListeners(eventSource)
        cleanup(() => eventSource.close())
      })
    }
  }

  onUnmount({ el }: AttributeContext): void {
    const eventSource = this.eventSources.get(el)
    if (eventSource) {
      eventSource.close()
    }
  }
}

export const ACCEPT = 'Accept'
export const CONTENT_TYPE = 'Content-Type'
export const TEXT_HTML = 'text/html'
export const APPLICATION_JSON = 'application/json'

async function fetcher(method: Method, { el, get, expressionEvaluated }: AttributeContext) {
  const urlSignal = get(method)
  if (!urlSignal) throw new Error(`No url for ${method}`)

  el.classList.add(LOADING_CLASS)

  const headers = new Headers()
  headers.append(ACCEPT, TEXT_HTML)
  headers.append(CONTENT_TYPE, APPLICATION_JSON)

  const ctxHeaders = get(REQ_HEADERS_CTX_KEY) as Headers
  if (ctxHeaders) {
    for (const [name, value] of ctxHeaders.entries()) {
      headers.append(name, value)
    }
  }

  const url = new URL(expressionEvaluated, window.location.origin)
  const dataStack = {}
  const dataStackJSON = JSON.stringify(dataStack)
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
  mergeHTMLFragments(el, html)
  el.classList.remove(LOADING_CLASS)
}

const p = new DOMParser()
function mergeHTMLFragments(el: Element, html: string) {
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
    }
  }
}
