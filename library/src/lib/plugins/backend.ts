import { fetchEventSource, FetchEventSourceInit } from '../external/fetch-event-source'
import { idiomorph } from '../external/idiomorph'
import { Actions, AttributeContext, AttributePlugin } from '../types'
import { publicSignals } from './attributes'
import { docWithViewTransitionAPI, supportsViewTransitions } from './visibility'

const CONTENT_TYPE = 'Content-Type'
const DATASTAR_REQUEST = 'datastar-request'
const APPLICATION_JSON = 'application/json'
const TRUE_STRING = 'true'
const DATASTAR_CLASS_PREFIX = 'datastar-'
const EVENT_FRAGMENT = `${DATASTAR_CLASS_PREFIX}fragment`
// const EVENT_REDIRECT = `${DATASTAR_CLASS_PREFIX}redirect`
// const EVENT_ERROR = `${DATASTAR_CLASS_PREFIX}error`
const INDICATOR_CLASS = `${DATASTAR_CLASS_PREFIX}indicator`
const INDICATOR_LOADING_CLASS = `${INDICATOR_CLASS}-loading`
const SETTLING_CLASS = `${DATASTAR_CLASS_PREFIX}settling`
const SWAPPING_CLASS = `${DATASTAR_CLASS_PREFIX}swapping`
const SELECTOR_SELF_SELECTOR = 'self'

const GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'

export const BackendActions: Actions = [GET, POST, PUT, PATCH, DELETE].reduce(
  (acc, method) => {
    acc[method] = async (ctx, urlExpression) => {
      ctx.upsertIfMissingFromStore('_dsPlugins.fetch', {})
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
  },
  {
    isFetching: async (_, selector: string) => {
      const indicators = document.querySelectorAll(selector)
      return Array.from(indicators).some((indicator) => {
        indicator.classList.contains(INDICATOR_LOADING_CLASS)
      })
    },
  } as Actions,
)

const KnowEventTypes = ['selector', 'merge', 'settle', 'fragment', 'redirect', 'error', 'store']

const FragmentMergeOptions = {
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
type FragmentMergeOption = (typeof FragmentMergeOptions)[keyof typeof FragmentMergeOptions]

const StoreMergeOptions = {
  Merge: 'merge',
  Replace: 'replace',
} as const
type StoreMergeOption = (typeof StoreMergeOptions)[keyof typeof StoreMergeOptions]

// Sets the header of the fetch request
export const HeadersPlugin: AttributePlugin = {
  prefix: 'header',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx) => {
    debugger
    ctx.upsertIfMissingFromStore('_dsPlugins.fetch', { headers: new Map<string, string>() })
    const s = ctx.store()
    const { headers } = s._dsPlugins.fetch
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
      ctx.upsertIfMissingFromStore('_dsPlugins.fetch.indicatorSelectors', {})
      const c = ctx.reactivity.computed(() => `${ctx.expressionFn(ctx)}`)
      const s = ctx.store()
      s._dsPlugins.fetch.indicatorSelectors[ctx.el.id] = c

      const indicator = document.querySelector(c.value)
      if (!indicator) {
        throw new Error(`No indicator found`)
      }
      indicator.classList.add(INDICATOR_CLASS)

      return () => {
        delete s._dsPlugins.fetch.indicatorSelectors[ctx.el.id]
      }
    })
  },
}

// Sets the fetch indicator selector
export const IsLoadingPlugin: AttributePlugin = {
  prefix: 'isLoadingId',
  mustNotEmptyExpression: true,
  onLoad: (ctx) => {
    ctx.upsertIfMissingFromStore('_dsPlugins.fetch.loadingIdentifiers', {})
    ctx.upsertIfMissingFromStore('_dsPlugins.fetch.isLoading', [])
    ctx.store()._dsPlugins.fetch.loadingIdentifiers[ctx.el.id] = ctx.expression

    return () => {
      /*
      // Can't get this to clean up properly, it seems to run every time the store is changed always refresh the store in callbacks
      const s = ctx.store()
      delete s._dsPlugins.fetch.loadingIdentifiers[ctx.el.id]
      const isLoadingArr = s._dsPlugins.fetch.isLoading.value as string[]
      const filtered = isLoadingArr.filter((id) => id !== ctx.expression)
      s._dsPlugins.fetch.isLoading.value = filtered
      */
    }
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchIndicatorPlugin, IsLoadingPlugin]

async function fetcher(method: string, urlExpression: string, ctx: AttributeContext) {
  const s = ctx.store()

  if (!urlExpression) {
    throw new Error(`No signal for ${method} on ${urlExpression}`)
  }

  const storeJSON = JSON.stringify(publicSignals({ ...s.value }))

  let hasIndicator = false,
    loadingTarget = ctx.el

  const indicatorSelector = s._dsPlugins.fetch?.indicatorSelectors?.[loadingTarget.id] || null
  if (indicatorSelector) {
    const indicator = document.querySelector(indicatorSelector.value)
    if (indicator) {
      loadingTarget = indicator
      loadingTarget.classList.remove(INDICATOR_CLASS)
      loadingTarget.classList.add(INDICATOR_LOADING_CLASS)
      hasIndicator = true
    }
  }

  const loadingIdentifier = s._dsPlugins.fetch?.loadingIdentifiers?.[loadingTarget.id] || null
  if (loadingIdentifier && !s._dsPlugins.fetch?.isLoading.value.includes(loadingIdentifier)) {
    s.isLoading.value = [...(s.isLoading.value || []), loadingIdentifier]
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
        merge: FragmentMergeOption = 'morph_element',
        exists = false,
        selector = '',
        settleTime = 500
      if (!evt.event.startsWith(DATASTAR_CLASS_PREFIX)) {
        throw new Error(`Unknown event: ${evt.event}`)
      }
      const isFragment = evt.event === EVENT_FRAGMENT

      const lines = evt.data.trim().split('\n')
      let currentDatatype = ''

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        if (!line?.length) continue

        const firstWord = line.split(' ', 1)[0]
        const isDatatype = KnowEventTypes.includes(firstWord)
        const isNewDatatype = isDatatype && firstWord !== currentDatatype
        if (isNewDatatype) {
          currentDatatype = firstWord
          line = line.slice(firstWord.length + 1)

          switch (currentDatatype) {
            case 'selector':
              selector = line
              break
            case 'merge':
              merge = line as FragmentMergeOption
              exists = Object.values(FragmentMergeOptions).includes(merge)
              if (!exists) {
                throw new Error(`Unknown merge option: ${merge}`)
              }
              break
            case 'settle':
              settleTime = parseInt(line)
              break
            case 'fragment':
              break
            case 'redirect':
              window.location.href = line
              return
            case 'store':
              const [mode, json] = line.split(' ', 1)
              exists = Object.values(StoreMergeOptions).includes(mode as StoreMergeOption)
              if (!exists) {
                throw new Error(`Unknown store option: ${merge}`)
              }

              const data = JSON.parse(json)
              switch (mode) {
                case 'merge':
                  ctx.mergeStore(data)
                  break
                case 'replace':
                  ctx.replaceStore(data)
                  break
                default:
                  throw new Error(`Unknown store mode`)
              }

              break
            case 'error':
              throw new Error(line)
            default:
              throw new Error(`Unknown data type`)
          }
        }

        if (currentDatatype === 'fragment') fragment += line + '\n'
      }

      if (isFragment) {
        if (!fragment?.length) fragment = '<div></div>'
        mergeHTMLFragment(ctx, selector, merge, fragment, settleTime)
      }
    },
    onclose: () => {
      // Always get a fresh store in callbacks since the reference might be stale
      const s = ctx.store()
      if (hasIndicator) {
        setTimeout(() => {
          loadingTarget.classList.remove(INDICATOR_LOADING_CLASS)
          loadingTarget.classList.add(INDICATOR_CLASS)
        }, 300)
      }

      if (s._dsPlugins.fetch.isLoading && loadingIdentifier) {
        s._dsPlugins.fetch.isLoading.value = s.isLoading.value.filter((id: string) => {
          return id !== loadingIdentifier
        })
      }
    },
  }

  if (req.headers && s._dsPlugins.fetch?.headers?.size()) {
    debugger
    for (const key in s._dsPlugins.fetch.headers) {
      const value = s._dsPlugins.fetch.headers.value[key]
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
  merge: FragmentMergeOption,
  fragment: string,
  settleTime: number,
) {
  const { el } = ctx

  fragContainer.innerHTML = fragment.trim()
  const frag = fragContainer.content.firstChild
  if (!(frag instanceof Element)) {
    throw new Error(`No fragment found`)
  }

  const useElAsTarget = selector === SELECTOR_SELF_SELECTOR

  let targets: Iterable<Element>
  if (useElAsTarget) {
    targets = [el]
  } else {
    const selectorOrID = selector || `#${frag.getAttribute('id')}`
    targets = document.querySelectorAll(selectorOrID) || []
    if (!!!targets) {
      throw new Error(`No targets found for ${selectorOrID}`)
    }
  }

  const applyToTargets = () => {
    for (const initialTarget of targets) {
      initialTarget.classList.add(SWAPPING_CLASS)
      const originalHTML = initialTarget.outerHTML
      let modifiedTarget = initialTarget
      switch (merge) {
        case FragmentMergeOptions.MorphElement:
          const result = idiomorph(modifiedTarget, frag)
          if (!result?.length) {
            throw new Error(`No morph result`)
          }
          const first = result[0] as Element
          modifiedTarget = first
          break
        case FragmentMergeOptions.InnerElement:
          // Replace the contents of the target element with the response
          modifiedTarget.innerHTML = frag.innerHTML
          break
        case FragmentMergeOptions.OuterElement:
          // Replace the entire target element with the response
          modifiedTarget.replaceWith(frag)
          break
        case FragmentMergeOptions.PrependElement:
          modifiedTarget.prepend(frag) //  Insert the response before the first child of the target element
          break
        case FragmentMergeOptions.AppendElement:
          modifiedTarget.append(frag) //  Insert the response after the last child of the target element
          break
        case FragmentMergeOptions.BeforeElement:
          modifiedTarget.before(frag) //  Insert the response before the target element
          break
        case FragmentMergeOptions.AfterElement:
          modifiedTarget.after(frag) //  Insert the response after the target element
          break
        case FragmentMergeOptions.DeleteElement:
          //  Deletes the target element regardless of the response
          setTimeout(() => modifiedTarget.remove(), settleTime)
          break
        case FragmentMergeOptions.UpsertAttributes:
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

  if (supportsViewTransitions) {
    docWithViewTransitionAPI.startViewTransition(() => applyToTargets())
  } else {
    applyToTargets()
  }
}
