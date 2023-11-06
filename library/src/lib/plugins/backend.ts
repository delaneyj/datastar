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
const DATASTAR_REQUEST = 'datastar-request'
const APPLICATION_JSON = 'application/json'
const TEXT_EVENT_STREAM = 'text/event-stream'
const TRUE_STRING = 'true'
const DATASTAR_CLASS_PREFIX = 'datastar'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}-indicator`
const LOADING_CLASS = `${DATASTAR_CLASS_PREFIX}-request`
const SETTLING_CLASS = `${DATASTAR_CLASS_PREFIX}-settling`
const SWAPPING_CLASS = `${DATASTAR_CLASS_PREFIX}-swapping`
const SELECTOR_SELF_SELECTOR = 'self'

const MergeOptions = {
  MorphElement: 'morph_element',
  InnerElement: 'inner_element',
  OuterElement: 'outer_element',
  PrependElement: 'prepend_element',
  AppendElement: 'append_element',
  BeforeElement: 'before_element',
  AfterElement: 'after_element',
  DeleteElement: 'delete_element',
  UpsertAttributes: 'upsert_attributes',
} as const
type MergeOption = (typeof MergeOptions)[keyof typeof MergeOptions]

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
}
.${LOADING_CLASS} .${INDICATOR_CLASS}{
 opacity:1;
 transition: opacity 300ms ease-in;
}
.${LOADING_CLASS}.${INDICATOR_CLASS}{
 opacity:1;
 transition: opacity 300s ease-in;
}
`
    document.head.appendChild(style)
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

    const onMessage = (evt: MessageEvent) => {
      mergeHTMLFragment(ctx, '', 'append_element', evt.data)
    }

    const onError = (evt: Event) => {
      console.error(evt)
      setup()
    }

    let eventSource: EventSource
    const cleanup = () => {
      if (eventSource) {
        eventSource.removeEventListener('message', onMessage)
        eventSource.removeEventListener('error', onError)
        eventSource.close()
      }
    }

    const setup = () => {
      cleanup()
      eventSource = new EventSource(url)
      eventSource.addEventListener('message', onMessage)
      eventSource.addEventListener('error', onError)
    }

    return () => {
      cleanup()
    }
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchURLPlugin, ServerSentEventsPlugin]

const sseRegexp = /(?<key>\w*): (?<value>.*)/gm
async function fetcher(method: string, ctx: AttributeContext) {
  const { el, store } = ctx
  const urlSignal: Signal<string> = store.fetch.elementURLs[el.id]
  if (!urlSignal) throw new Error(`No signal for ${method}`)

  el.classList.add(LOADING_CLASS)
  // console.log(`Adding ${LOADING_CLASS} to ${el.id}`)

  const url = new URL(urlSignal.value, window.location.origin)

  const headers = new Headers()
  headers.append(ACCEPT, TEXT_EVENT_STREAM)
  headers.append(CONTENT_TYPE, APPLICATION_JSON)
  headers.append(DATASTAR_REQUEST, TRUE_STRING)

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
  method = method.toUpperCase()
  const req: RequestInit = { method, headers }
  if (method === 'GET') {
    const queryParams = new URLSearchParams(url.search)
    queryParams.append('datastar', storeJSON)
    url.search = queryParams.toString()
  } else {
    req.body = storeJSON
  }

  const response = await fetch(url, req)

  if (!response.ok) {
    const isRedirect = response.status >= 300 && response.status < 400
    if (!isRedirect) throw new Error(`Response was not ok and wasn't a redirect, can't merge.`)
    let url = await response.text()
    if (url.startsWith('/')) {
      url = window.location.origin + url
    }
    console.log(`Redirecting to ${url}`)
    window.location.replace(url)
    return
  }

  if (!response.body) throw new Error(`No response body`)
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    value.split('\n\n').forEach((evtBlock) => {
      console.log(evtBlock)
      const matches = [...evtBlock.matchAll(sseRegexp)]
      if (matches.length) {
        let fragment = '',
          merge: MergeOption = 'morph_element',
          selector = ''

        let dataIdx = 0
        for (const match of matches) {
          if (!match.groups) continue
          const { key, value } = match.groups
          switch (key) {
            case 'event':
              if (value !== 'datastar-fragment') {
                throw new Error(`datastar-fragment event not supported`)
              }
              break
            case 'data':
              switch (dataIdx) {
                case 0:
                  selector = value
                  break
                case 1:
                  const vmo = value as MergeOption
                  const exists = Object.values(MergeOptions).includes(vmo)
                  if (!exists) {
                    throw new Error(`Unknown merge option: ${value}`)
                  }
                  merge = vmo
                  break
                case 2:
                  fragment = value
                  break
              }
              dataIdx++
          }
        }

        mergeHTMLFragment(ctx, selector, merge, fragment)
      }
    })
  }

  el.classList.remove(LOADING_CLASS)
}

const fragContainer = document.createElement('template')
export function mergeHTMLFragment(ctx: AttributeContext, selector: string, merge: MergeOption, fragment: string) {
  const { el } = ctx

  fragContainer.innerHTML = fragment
  const frag = fragContainer.content.firstChild
  if (!(frag instanceof Element)) {
    throw new Error(`Fragment is not an element, source '${fragment}'`)
  }

  const useElAsTarget = selector === SELECTOR_SELF_SELECTOR

  let targets: Iterable<Element>
  if (useElAsTarget) {
    targets = [el]
  } else {
    const selectorOrID = selector || `#${frag.getAttribute('id')}`
    targets = document.querySelectorAll(selectorOrID) || []
    if (!!!targets) throw new Error(`No target elements, selector: ${selector}`)
  }

  for (const target of targets) {
    target.classList.add(SWAPPING_CLASS)

    const originalHTML = target.outerHTML

    switch (merge) {
      case MergeOptions.MorphElement:
        idiomorph(target, frag)
        break
      case MergeOptions.InnerElement:
        target.innerHTML = frag.innerHTML //  The default, replace the inner html of the target element
        break
      case MergeOptions.OuterElement:
        target.outerHTML = frag.outerHTML //  Replace the entire target element with the response
        break
      case MergeOptions.PrependElement:
        target.prepend(frag) //  Insert the response before the first child of the target element
        break
      case MergeOptions.AppendElement:
        target.append(frag) //  Insert the response after the last child of the target element
        break
      case MergeOptions.BeforeElement:
        target.before(frag) //  Insert the response before the target element
        break
      case MergeOptions.AfterElement:
        target.after(frag) //  Insert the response after the target element
        break
      case MergeOptions.DeleteElement:
        target.remove() //  Deletes the target element regardless of the response
        break
      case MergeOptions.UpsertAttributes:
        //  Upsert the attributes of the target element
        frag.getAttributeNames().forEach((attrName) => {
          const value = frag.getAttribute(attrName)!
          target.setAttribute(attrName, value)
        })
        break
      default:
        throw new Error(`Unknown merge type: ${merge}`)
    }
    ctx.applyPlugins(target)

    target.classList.remove(SWAPPING_CLASS)

    const revisedHTML = target.outerHTML

    if (originalHTML !== revisedHTML) {
      target.classList.add(SETTLING_CLASS)
      setTimeout(() => {
        target.classList.remove(SETTLING_CLASS)
      }, 300)
    }
  }
}
