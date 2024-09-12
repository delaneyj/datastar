export * from './engine'
export * from './dom'
export * from './plugins'
export * from './types'

import type { EventProcessor, AttributeContext, FetchEventLocalParams, FragmentMergeOptions } from './types'
import type { EventSourceMessage } from './external/fetch-event-source'
import { version } from '../../package.json'
import { Datastar } from './engine'
import {
  BrowserHistoryPlugins,
  AttributeActions,
  AttributePlugins,
  BackendActions,
  BackendPlugins,
  VisibilityActions,
  VisibilityPlugins,
} from './plugins'
import { HelperActions } from './plugins/helpers'
import { elemToSelector } from './plugins/core'
import { Actions, AttributePlugin, DatastarEvent, datastarEventName, SendDatastarEvent } from './types'

export { apply } from './external/ts-merge-patch'

export function runDatastarWith(actions: Actions = {}, ...plugins: AttributePlugin[]) {
  const ds = new Datastar(actions, ...plugins)
  ds.run()
  return ds
}
// set of event processors that should be loaded as local event processors by default
export const localEventProcessors: Record<string, EventProcessor> = {
  "selector": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, localParams: FetchEventLocalParams) => {
    localParams.selector = line
    return
  },
  "merge": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, localParams: FetchEventLocalParams) => {
    localParams.merge = line as FragmentMergeOptions
    return
  },
  "settle": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, localParams: FetchEventLocalParams) => {
    localParams.settleTime = parseInt(line)
    return
  },
  "fragment": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, localParams: FetchEventLocalParams) => {
    localParams.fragment = line
    return
  },
  "redirect": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, _localParams: FetchEventLocalParams) => {
    window.location.href = line
    return
  },
  "error": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, _localParams: FetchEventLocalParams) => {
    throw new Error(line)
  },
  "vt": (_ctx: AttributeContext, _evt: EventSourceMessage, line: string, localParams: FetchEventLocalParams) => {
    localParams.useViewTransition = line === 'true'
    return
  }
}

export function runDatastarWithAllPlugins(addedActions: Actions = {}, ...addedPlugins: AttributePlugin[]) {
  const actions: Actions = Object.assign(
    {},
    HelperActions,
    AttributeActions,
    BackendActions,
    VisibilityActions,
    addedActions,
  )
  const allPlugins = [...BackendPlugins, ...VisibilityPlugins, ...AttributePlugins, ...addedPlugins, ...BrowserHistoryPlugins]
  return runDatastarWith(actions, ...allPlugins)
}

const datastarDefaultEventOptions: CustomEventInit = {
  bubbles: true,
  cancelable: true,
  composed: true,
}

const winAny = window as any

export const sendDatastarEvent = ((
  category: 'core' | 'plugin',
  subcategory: string,
  type: string,
  target: Element | Document | Window | string,
  message: string,
  opts: CustomEventInit = datastarDefaultEventOptions,
) => {
  winAny.dispatchEvent(
    new CustomEvent<DatastarEvent>(
      datastarEventName,
      Object.assign(
        {
          detail: {
            time: new Date(),
            category,
            subcategory,
            type,
            target: elemToSelector(target),
            message,
          },
        },
        opts,
      ),
    ),
  )
}) satisfies SendDatastarEvent

// Timeeout allows inspector to attach to all elements before sending the event
if (!winAny.ds) {
  setTimeout(() => {
    sendDatastarEvent('core', 'init', 'start', document.body, `Datastar v${version} loading`)

    const start = performance.now()
    winAny.ds = runDatastarWithAllPlugins()
    const end = performance.now()

    sendDatastarEvent(
      'core',
      'init',
      'end',
      document.body,
      `Datastar v${version} loaded and attached to all DOM elements in ${(end - start).toFixed(2)}ms`,
    )

    // define classes needed by the inspector
    const style = document.createElement('style')
    style.innerHTML = `
.datastar-inspector-highlight {
 border: 2px solid blue;
}
`
    document.head.appendChild(style)

    // listen for messages from the inspector
    window.addEventListener('datastar-inspector-event', (evt) => {
      if ('detail' in evt && typeof evt.detail === 'object' && evt.detail) {
        const { detail } = evt
        if ('script' in detail && typeof detail.script === 'string') {
          try {
            const func = new Function(detail.script)
            func()
          } catch (e: unknown) {
            console.error(e)
          }
        }
      }
    })
  }, 0)
}
