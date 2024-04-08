export * from './core'
export * from './dom'
export * from './types'

import { version } from '../../package.json'
import { Datastar } from './core'
import { AttributePlugins, BackendActions, BackendPlugins, VisibilityPlugins } from './plugins'
import { HelperActions } from './plugins/helpers'
import { Actions, AttributePlugin } from './types'

export function runDatastarWith(actions: Actions = {}, ...plugins: AttributePlugin[]) {
  const start = performance.now()
  const ds = new Datastar(actions, ...plugins)
  ds.run()
  const end = performance.now()
  console.log(`Datastar v${version} loaded and attached to all DOM elements in ${end - start}ms`)
  return ds
}

export function runDatastarWithAllPlugins(addedActions: Actions = {}, ...addedPlugins: AttributePlugin[]) {
  const actions: Actions = Object.assign({}, HelperActions, BackendActions, addedActions)
  const allPlugins = [...BackendPlugins, ...VisibilityPlugins, ...AttributePlugins, ...addedPlugins]
  return runDatastarWith(actions, ...allPlugins)
}

const winAny = window as any
winAny.ds = runDatastarWithAllPlugins()
winAny.dispatchEvent(new CustomEvent('datastar-ready'))
