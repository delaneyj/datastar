export * from './core'
export * from './dom'
export * from './plugins'
export * from './types'

import { version } from '../../package.json'
import { Datastar } from './core'
import {
  AttributeActions,
  AttributePlugins,
  BackendActions,
  BackendPlugins,
  VisibilityActions,
  VisibilityPlugins,
} from './plugins'
import { HelperActions } from './plugins/helpers'
import { Actions, AttributePlugin, DatastarEvent, datastarEventName } from './types'

export function runDatastarWith(actions: Actions = {}, ...plugins: AttributePlugin[]) {
  const ds = new Datastar(actions, ...plugins)
  ds.run()
  return ds
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
  const allPlugins = [...BackendPlugins, ...VisibilityPlugins, ...AttributePlugins, ...addedPlugins]
  return runDatastarWith(actions, ...allPlugins)
}

const datastarDefaultEventOptions: CustomEventInit = {
  bubbles: true,
  cancelable: true,
  composed: true,
}

const winAny = window as any

export function sendDatastarEvent(
  category: 'core' | 'plugin',
  subcategory: string,
  type: string,
  el: Element | Window | Document | null,
  message: string,
  opts: CustomEventInit = datastarDefaultEventOptions,
) {
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
            el,
            message,
          },
        },
        opts,
      ),
    ),
  )
}

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
  }, 0)
}
