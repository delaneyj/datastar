import { fetchEventSource, FetchEventSourceInit } from '../external/fetch-event-source'
import { idiomorph } from '../external/idiomorph'
import { Signal } from '../external/preact-core'
import { Actions, AttributeContext, AttributePlugin, ExpressionFunction } from '../types'
import { remoteSignals } from './attributes'
import { docWithViewTransitionAPI, supportsViewTransitions } from './visibility'

const CONTENT_TYPE = 'Content-Type'
const DATASTAR_REQUEST = 'datastar-request'
const APPLICATION_JSON = 'application/json'
const TRUE_STRING = 'true'
const DATASTAR_CLASS_PREFIX = 'datastar-'
const EVENT_FRAGMENT = `${DATASTAR_CLASS_PREFIX}fragment`
const EVENT_SIGNAL = `${DATASTAR_CLASS_PREFIX}signal`
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

const KnowEventTypes = ['selector', 'merge', 'settle', 'fragment', 'redirect', 'error', 'vt']

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

// Sets the header of the fetch request
export const HeadersPlugin: AttributePlugin = {
  prefix: 'header',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx) => {
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
type IndicatorReference = { el: HTMLElement; count: number }

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
      ctx.upsertIfMissingFromStore('_dsPlugins.fetch.indicatorElements', {})
      ctx.upsertIfMissingFromStore('_dsPlugins.fetch.indicatorsVisible', [])
      const c = ctx.reactivity.computed(() => `${ctx.expressionFn(ctx)}`)
      const s = ctx.store()

      const indicators = document.querySelectorAll(c.value)
      if (indicators.length === 0) {
        throw new Error(`No indicator found`)
      }
      indicators.forEach((indicator) => {
        indicator.classList.add(INDICATOR_CLASS)
      })

      s._dsPlugins.fetch.indicatorElements[ctx.el.id] = ctx.reactivity.signal(indicators)

      return () => {
        delete s._dsPlugins.fetch.indicatorElements[ctx.el.id]
      }
    })
  },
}

export const BackendPlugins: AttributePlugin[] = [HeadersPlugin, FetchIndicatorPlugin]

function fetcher(method: string, urlExpression: string, ctx: AttributeContext) {
  const store = ctx.store()

  if (!urlExpression) {
    throw new Error(`No signal for ${method} on ${urlExpression}`)
  }

  const storeJSON = JSON.stringify(remoteSignals({ ...store.value }))

  const loadingTarget = ctx.el as HTMLElement

  const indicatorElements: HTMLElement[] = store?._dsPlugins?.fetch?.indicatorElements
    ? store._dsPlugins.fetch.indicatorElements[loadingTarget.id]?.value || []
    : []
  const indicatorsVisible: Signal<IndicatorReference[]> | undefined = store?._dsPlugins.fetch?.indicatorsVisible
  indicatorElements.forEach((indicator) => {
    if (!indicator || !indicatorsVisible) return
    const indicatorVisibleIndex = indicatorsVisible.value.findIndex((indicatorVisible) => {
      if (!indicatorVisible) return false
      return indicator.isSameNode(indicatorVisible.el)
    })
    if (indicatorVisibleIndex > -1) {
      const indicatorVisible = indicatorsVisible.value[indicatorVisibleIndex]
      const indicatorsVisibleNew = [...indicatorsVisible.value]
      delete indicatorsVisibleNew[indicatorVisibleIndex]
      indicatorsVisible.value = [
        ...indicatorsVisibleNew.filter((ind) => {
          return !!ind
        }),
        { el: indicator, count: indicatorVisible.count + 1 },
      ]
    } else {
      indicator.classList.remove(INDICATOR_CLASS)
      indicator.classList.add(INDICATOR_LOADING_CLASS)
      indicatorsVisible.value = [...indicatorsVisible.value, { el: indicator, count: 1 }]
    }
  })

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
      else if (!evt.event.startsWith(DATASTAR_CLASS_PREFIX)) {
        console.log(`Unknown event: ${evt.event}`)
        debugger
      }

      if (evt.event === EVENT_SIGNAL) {
        const fnContents = ` return Object.assign({...ctx.store()}, ${evt.data})`
        try {
          const fn = new Function('ctx', fnContents) as ExpressionFunction
          const data = fn(ctx)
          ctx.mergeStore(data)
          ctx.applyPlugins(document.body)
        } catch (e) {
          console.log(fnContents)
          console.error(e)
          debugger
        }
      } else {
        let fragment = '',
          merge: FragmentMergeOption = 'morph_element',
          exists = false,
          selector = '',
          settleTime = 500,
          useViewTransition = true

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
              case 'error':
                throw new Error(line)
              case 'vt':
                useViewTransition = line === 'true'
                break
              default:
                throw new Error(`Unknown data type`)
            }
          }

          if (currentDatatype === 'fragment') fragment += line + '\n'
        }

        if (isFragment) {
          if (!fragment?.length) fragment = '<div></div>'
          mergeHTMLFragment(ctx, selector, merge, fragment, settleTime, useViewTransition)
        }
      }
    },
    onclose: () => {
      const store = ctx.store()
      const indicatorsVisible: Signal<IndicatorReference[]> = store?._dsPlugins?.fetch?.indicatorsVisible || []
      const indicatorElements: HTMLElement[] =
        store?._dsPlugins?.fetch?.indicatorElements || []
          ? store._dsPlugins.fetch?.indicatorElements[loadingTarget.id]?.value || []
          : []

      const indicatorCleanupPromises: Promise<() => void>[] = []

      indicatorElements.forEach((indicator) => {
        if (!indicator || !indicatorsVisible) return
        const indicatorsVisibleNew = indicatorsVisible.value
        const indicatorVisibleIndex = indicatorsVisibleNew.findIndex((indicatorVisible) => {
          if (!indicatorVisible) return false
          return indicator.isSameNode(indicatorVisible.el)
        })
        const indicatorVisible = indicatorsVisibleNew[indicatorVisibleIndex]
        if (!indicatorVisible) return
        if (indicatorVisible.count < 2) {
          indicatorCleanupPromises.push(
            new Promise(() =>
              setTimeout(() => {
                indicator.classList.remove(INDICATOR_LOADING_CLASS)
                indicator.classList.add(INDICATOR_CLASS)
              }, 300),
            ),
          )
          delete indicatorsVisibleNew[indicatorVisibleIndex]
        } else if (indicatorVisibleIndex > -1) {
          indicatorsVisibleNew[indicatorVisibleIndex].count = indicatorsVisibleNew[indicatorVisibleIndex].count - 1
        }
        indicatorsVisible.value = indicatorsVisibleNew.filter((ind) => {
          return !!ind
        })
      })

      Promise.all(indicatorCleanupPromises)
    },
  }

  if (req.headers && store?._dsPlugins?.fetch?.headers?.size()) {
    for (const key in store?._dsPlugins.fetch.headers) {
      const value = store._dsPlugins.fetch.headers.value[key]
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

  fetchEventSource(url, req)
}

const fragContainer = document.createElement('template')
export function mergeHTMLFragment(
  ctx: AttributeContext,
  selector: string,
  merge: FragmentMergeOption,
  fragment: string,
  settleTime: number,
  useViewTransition: boolean,
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

  if (supportsViewTransitions && useViewTransition) {
    docWithViewTransitionAPI.startViewTransition(() => applyToTargets())
  } else {
    applyToTargets()
  }
}

export const BackendActions: Actions = [GET, POST, PUT, PATCH, DELETE].reduce(
  (acc, method) => {
    acc[method] = async (ctx, urlExpression) => {
      fetcher(method, urlExpression, ctx)
    }
    return acc
  },
  {
    isFetching: async (ctx: AttributeContext, selector: string) => {
      const indicators = document.querySelectorAll(selector)
      const store = ctx.store()
      const indicatorsVisible: IndicatorReference[] | undefined =
        store?._dsPlugins?.fetch.indicatorsVisible?.value || []
      if (!indicatorsVisible) return false
      return Array.from(indicators).some((indicator) => {
        return indicatorsVisible.some((indicatorVisible) => {
          if (!indicatorVisible) return false
          return indicatorVisible.el.isSameNode(indicator) && indicatorVisible.count > 0
        })
      })
    },
  } as Actions,
)
