import { DATASTAR_ERROR } from '..'
import { fetchEventSource, FetchEventSourceInit } from '../external/fetch-event-source'
import { idiomorph } from '../external/idiomorph'
import { Actions, AttributeContext, AttributePlugin } from '../types'

const GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'

export const BackendActions: Actions = [GET, POST, PUT, PATCH, DELETE].reduce((acc, method) => {
  acc[method] = async (ctx, urlExpression) => {
    const da = Document as any
    if (!da.startViewTransition) {
      await fetcher(method, urlExpression, ctx)
      return
    }

    new Promise((resolve) => {
      da.startViewTransition(async () => {
        await fetcher(method, urlExpression, ctx)
        resolve(void 0)
      })
    })
  }
  return acc
}, {} as Actions)

const CONTENT_TYPE = 'Content-Type'
const DATASTAR_REQUEST = 'datastar-request'
const APPLICATION_JSON = 'application/json'
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
    const s = ctx.store()
    if (!s.fetch) s.fetch = {}
    if (!s.fetch.headers) s.fetch.headers = {}
    const headers = s.fetch.headers
    const key = ctx.key[0].toUpperCase() + ctx.key.slice(1)
    headers[key] = ctx.reactivity.computed(() => ctx.expressionFn(ctx))
    return () => {
      delete headers[key]
    }
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
      const s = ctx.store()
      if (!s.fetch) s.fetch = {}
      if (!s.fetch.indicatorSelectors) s.fetch.indicatorSelectors = {}
      s.fetch.indicatorSelectors[ctx.el.id] = c

      const indicator = document.querySelector(c.value)
      if (!indicator) {
        // throw new Error(`No indicator found`)
        throw DATASTAR_ERROR
      }
      indicator.classList.add(INDICATOR_CLASS)

      return () => {
        delete s.fetch.indicatorSelectors[ctx.el.id]
      }
    })
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchIndicatorPlugin]

async function fetcher(method: string, urlExpression: string, ctx: AttributeContext) {
  const s = ctx.store()

  if (!urlExpression) {
    // throw new Error(`No signal for ${method} on ${urlExpression}`)
    throw DATASTAR_ERROR
  }

  const storeWithoutFetch = { ...s.value }
  delete storeWithoutFetch.fetch
  const storeJSON = JSON.stringify(storeWithoutFetch)

  let hasIndicator = false,
    loadingTarget = ctx.el

  const indicatorSelector = s.fetch?.indicatorSelectors?.[loadingTarget.id] || null
  if (indicatorSelector) {
    const indicator = document.querySelector(indicatorSelector.value)
    if (indicator) {
      loadingTarget = indicator
      loadingTarget.classList.remove(INDICATOR_CLASS)
      loadingTarget.classList.add(INDICATOR_LOADING_CLASS)
      hasIndicator = true
    }
  }

  // console.log(`Adding ${LOADING_CLASS} to ${el.id}`)
  const url = new URL(urlExpression, window.location.origin)
  method = method.toUpperCase()
  const req: FetchEventSourceInit = {
    method,
    headers: {
      [CONTENT_TYPE]: APPLICATION_JSON,
      [DATASTAR_REQUEST]: TRUE_STRING,
    },
    onmessage: (evt) => {
      if (!evt.event) return
      let fragment = '',
        merge: MergeOption = 'morph_element',
        selector = '',
        settleTime = 500,
        isRedirect = false,
        redirectURL = '',
        error: Error | undefined = undefined,
        isError = false,
        isFragment = false
      if (!evt.event.startsWith(DATASTAR_CLASS_PREFIX)) {
        // throw new Error(`Unknown event: ${evt.event}`)
        throw DATASTAR_ERROR
      }
      const eventType = evt.event.slice(DATASTAR_CLASS_PREFIX.length)
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
          throw `Unknown event: ${evt}`
      }

      evt.data.split('\n').forEach((dataLine) => {
        const offset = dataLine.indexOf(' ')
        if (offset === -1) {
          // throw new Error(`Missing space in data`)
          throw DATASTAR_ERROR
        }

        const type = dataLine.slice(0, offset)
        const contents = dataLine.slice(offset + 1)

        switch (type) {
          case 'selector':
            selector = contents
            break
          case 'merge':
            const vmo = contents as MergeOption
            const exists = Object.values(MergeOptions).includes(vmo)
            if (!exists) {
              // throw new Error(`Unknown merge option: ${vmo}`)
              throw DATASTAR_ERROR
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
            // throw new Error(`Unknown data type`)
            throw DATASTAR_ERROR
        }
      })

      if (isError && error) {
        throw error
      } else if (isRedirect && redirectURL) {
        window.location.href = redirectURL
      } else if (isFragment && fragment) {
        mergeHTMLFragment(ctx, selector, merge, fragment, settleTime)
      } else {
        // throw new Error(`Unknown event: ${evt}`)
        throw DATASTAR_ERROR
      }
    },
    onclose: () => {
      if (hasIndicator) {
        setTimeout(() => {
          loadingTarget.classList.remove(INDICATOR_LOADING_CLASS)
          loadingTarget.classList.add(INDICATOR_CLASS)
        }, 300)
      }
    },
  }

  if (s.fetch?.headers?.value && req.headers) {
    for (const key in s.fetch.headers.value) {
      const value = s.fetch.headers.value[key]
      req.headers[key] = value
    }
  }

  if (method === 'GET') {
    const queryParams = new URLSearchParams(url.search)
    queryParams.append('datastar', storeJSON)
    url.search = queryParams.toString()
  } else {
    req.body = storeJSON
  }

  await fetchEventSource(url, req)
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
    // throw new Error(`No fragment found`)
    throw DATASTAR_ERROR
  }

  const useElAsTarget = selector === SELECTOR_SELF_SELECTOR

  let targets: Iterable<Element>
  if (useElAsTarget) {
    targets = [el]
  } else {
    const selectorOrID = selector || `#${frag.getAttribute('id')}`
    targets = document.querySelectorAll(selectorOrID) || []
    if (!!!targets) {
      // throw new Error(`No targets found for ${selectorOrID}`)
      throw DATASTAR_ERROR
    }
  }

  for (const initialTarget of targets) {
    initialTarget.classList.add(SWAPPING_CLASS)
    const originalHTML = initialTarget.outerHTML
    let modifiedTarget = initialTarget
    switch (merge) {
      case MergeOptions.MorphElement:
        const result = idiomorph(modifiedTarget, frag)
        if (!result?.length) {
          //  throw new Error(`No morph result`)
          throw DATASTAR_ERROR
        }
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
        // throw new Error(`Unknown merge type: ${merge}`)
        throw DATASTAR_ERROR
    }
    modifiedTarget.classList.add(SWAPPING_CLASS)

    ctx.cleanupElementRemovals(initialTarget)
    ctx.applyPlugins(document.body)

    setTimeout(() => {
      initialTarget.classList.remove(SWAPPING_CLASS)
      modifiedTarget.classList.remove(SWAPPING_CLASS)
    }, settleTime)

    const revisedHTML = modifiedTarget.outerHTML

    if (originalHTML !== revisedHTML) {
      modifiedTarget.classList.add(SETTLING_CLASS)
      setTimeout(() => {
        modifiedTarget.classList.remove(SETTLING_CLASS)
      }, settleTime)
    }
  }
}
