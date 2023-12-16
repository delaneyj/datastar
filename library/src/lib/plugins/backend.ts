import { idiomorph } from '../external/idiomorph'
import { JSONStringify } from '../external/json-bigint'
import { Signal } from '../external/preact-core'
import { Actions, AttributeContext, AttributePlugin } from '../types'
const GET = 'get'
const POST = 'post'
const PUT = 'put'
const PATCH = 'patch'
const DELETE = 'delete'
const Methods = [GET, POST, PUT, PATCH, DELETE]

export const BackendActions: Actions = Methods.reduce((acc, method) => {
  acc[method] = async (ctx) => {
    const da = Document as any
    if (!da.startViewTransition) {
      await fetcher(method, ctx)
      return
    }
    return new Promise((resolve) => {
      da.startViewTransition(async () => {
        await fetcher(method, ctx)
        resolve()
      })
    })
  }
  return acc
}, {} as Actions)

const ACCEPT = 'Accept'
const CONTENT_TYPE = 'Content-Type'
const DATASTAR_REQUEST = 'datastar-request'
const APPLICATION_JSON = 'application/json'
const TEXT_EVENT_STREAM = 'text/event-stream'
const TRUE_STRING = 'true'
const DATASTAR_CLASS_PREFIX = 'datastar-'
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}indicator`
const INDICATOR_LOADING_CLASS = `${INDICATOR_CLASS}-loading`
const SETTLING_CLASS = `${DATASTAR_CLASS_PREFIX}settling`
const SWAPPING_CLASS = `${DATASTAR_CLASS_PREFIX}swapping`
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

// Sets the header of the fetch request
export const HeadersPlugin: AttributePlugin = {
  prefix: 'header',
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

// Sets the fetch url
export const FetchURLPlugin: AttributePlugin = {
  prefix: 'fetchUrl',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  onGlobalInit: ({ mergeStore }) => {
    mergeStore({
      fetch: {
        headers: {},
        elementURLs: {},
        indicatorSelectors: {},
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

// Sets the fetch indicator selector
export const FetchIndicatorPlugin: AttributePlugin = {
  prefix: 'fetchIndicator',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  onGlobalInit: () => {
    const style = document.createElement('style')
    style.innerHTML = `
.${INDICATOR_CLASS}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${INDICATOR_LOADING_CLASS} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`
    document.head.appendChild(style)
  },
  onLoad: (ctx) => {
    return ctx.reactivity.effect(() => {
      const c = ctx.reactivity.computed(() => `${ctx.expressionFn(ctx)}`)
      ctx.store.fetch.indicatorSelectors[ctx.el.id] = c

      const indicator = document.querySelector(c.value)
      if (!indicator) throw new Error(`No indicator found for ${c.value}`)
      indicator.classList.add(INDICATOR_CLASS)

      return () => {
        delete ctx.store.fetch.indicatorSelectors[ctx.el.id]
      }
    })
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchURLPlugin, FetchIndicatorPlugin]

const sseRegexp = /(?<key>\w*): (?<value>.*)/gm
async function fetcher(method: string, ctx: AttributeContext) {
  const { el, store } = ctx
  const urlSignal: Signal<string> = store.fetch.elementURLs[el.id]
  if (!urlSignal) {
    // throw new Error(`No signal for ${method} on ${el.id}`)
    return
  }

  const storeWithoutFetch = { ...store.value }
  delete storeWithoutFetch.fetch
  const storeJSON = JSONStringify(storeWithoutFetch)
  // console.log(`Sending ${storeJSON}`)
  // debugger

  let loadingTarget = el
  let hasIndicator = false
  const indicatorSelector = store.fetch.indicatorSelectors[el.id]
  if (indicatorSelector) {
    const indicator = document.querySelector(indicatorSelector)
    if (indicator) {
      loadingTarget = indicator
      loadingTarget.classList.remove(INDICATOR_CLASS)
      loadingTarget.classList.add(INDICATOR_LOADING_CLASS)
      hasIndicator = true
    }
  }

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

  if (!response.ok) throw new Error(`Response was not ok, url: ${url}, status: ${response.status}`)

  if (!response.body) throw new Error(`No response body`)
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    value.split('\n\n').forEach((evtBlock) => {
      // console.log(evtBlock)
      const matches = [...evtBlock.matchAll(sseRegexp)]
      if (matches.length) {
        let fragment = '',
          merge: MergeOption = 'morph_element',
          selector = '',
          settleTime = 0,
          isRedirect = false,
          redirectURL = '',
          error: Error | undefined = undefined,
          isError = false,
          isFragment = false

        for (const match of matches) {
          if (!match.groups) continue
          const { key, value } = match.groups
          switch (key) {
            case 'event':
              if (!value.startsWith(DATASTAR_CLASS_PREFIX)) {
                throw new Error(`Unknown event: ${value}`)
              }
              const eventType = value.slice(DATASTAR_CLASS_PREFIX.length)
              switch (eventType) {
                case 'redirect':
                  isRedirect = true
                  break
                case 'fragment':
                  isFragment = true
                  break
                case 'error':
                  isError = true
                  break
                default:
                  throw new Error(`Unknown event: ${value}`)
              }
              break
            case 'data':
              const offset = value.indexOf(' ')
              if (offset === -1) {
                throw new Error(`Missing space in data`)
              }
              const type = value.slice(0, offset)
              const contents = value.slice(offset + 1)

              switch (type) {
                case 'selector':
                  selector = contents
                  break
                case 'merge':
                  const vmo = contents as MergeOption
                  const exists = Object.values(MergeOptions).includes(vmo)
                  if (!exists) {
                    throw new Error(`Unknown merge option: ${value}`)
                  }
                  merge = vmo
                  break
                case 'settle':
                  settleTime = parseInt(contents)
                  break
                case 'fragment':
                case 'html':
                  fragment = contents
                  break
                case 'redirect':
                  redirectURL = contents
                  break
                case 'error':
                  error = new Error(contents)
                  break
                default:
                  throw new Error(`Unknown data type: ${type}`)
              }
          }
        }

        if (isError && error) {
          throw error
        } else if (isRedirect && redirectURL) {
          window.location.href = redirectURL
        } else if (isFragment && fragment) {
          mergeHTMLFragment(ctx, selector, merge, fragment, settleTime)
        } else {
          throw new Error(`Unknown event block: ${evtBlock}`)
        }
      }
    })
  }

  if (hasIndicator) {
    loadingTarget.classList.remove(INDICATOR_LOADING_CLASS)
    loadingTarget.classList.add(INDICATOR_CLASS)
  }
}

const fragContainer = document.createElement('template')
export function mergeHTMLFragment(
  ctx: AttributeContext,
  selector: string,
  merge: MergeOption,
  fragment: string,
  settleTime: number,
) {
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

  for (const initialTarget of targets) {
    initialTarget.classList.add(SWAPPING_CLASS)

    const originalHTML = initialTarget.outerHTML

    let modifiedTarget = initialTarget

    switch (merge) {
      case MergeOptions.MorphElement:
        const result = idiomorph(modifiedTarget, frag)
        if (!result?.length) throw new Error(`Failed to morph element`)
        const first = result[0] as Element
        modifiedTarget = first
        break
      case MergeOptions.InnerElement:
        // Replace the contents of the target element with the response
        modifiedTarget.innerHTML = frag.innerHTML
        break
      case MergeOptions.OuterElement:
        // Replace the entire target element with the response
        modifiedTarget.replaceWith(frag)
        break
      case MergeOptions.PrependElement:
        modifiedTarget.prepend(frag) //  Insert the response before the first child of the target element
        break
      case MergeOptions.AppendElement:
        modifiedTarget.append(frag) //  Insert the response after the last child of the target element
        break
      case MergeOptions.BeforeElement:
        modifiedTarget.before(frag) //  Insert the response before the target element
        break
      case MergeOptions.AfterElement:
        modifiedTarget.after(frag) //  Insert the response after the target element
        break
      case MergeOptions.DeleteElement:
        //  Deletes the target element regardless of the response
        setTimeout(() => modifiedTarget.remove(), settleTime)
        break
      case MergeOptions.UpsertAttributes:
        //  Upsert the attributes of the target element
        frag.getAttributeNames().forEach((attrName) => {
          const value = frag.getAttribute(attrName)!
          modifiedTarget.setAttribute(attrName, value)
        })
        break
      default:
        throw new Error(`Unknown merge type: ${merge}`)
    }
    modifiedTarget.classList.add(SWAPPING_CLASS)

    ctx.cleanupElementRemovals(initialTarget)
    ctx.applyPlugins(modifiedTarget)

    initialTarget.classList.remove(SWAPPING_CLASS)
    modifiedTarget.classList.remove(SWAPPING_CLASS)

    const revisedHTML = modifiedTarget.outerHTML

    if (originalHTML !== revisedHTML) {
      modifiedTarget.classList.add(SETTLING_CLASS)
      setTimeout(() => {
        modifiedTarget.classList.remove(SETTLING_CLASS)
      }, settleTime)
    }
  }
}
