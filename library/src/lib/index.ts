export * from './core'
export * from './dom'
export * from './types'

import { Datastar } from './core'
import { AttributePlugins } from './plugins/attributes'
import { BackendActions, BackendPlugins } from './plugins/backend'
import { VisibilityPlugins } from './plugins/visibility'
import { Actions } from './types'

const start = performance.now()

const actions: Actions = Object.assign({}, BackendActions)
const plugins = [...BackendPlugins, ...VisibilityPlugins, ...AttributePlugins]
export const datastar = new Datastar(actions, ...plugins)

const end = performance.now()
console.log(`Datastar loaded and attached to all DOM elements in ${end - start}ms`)
