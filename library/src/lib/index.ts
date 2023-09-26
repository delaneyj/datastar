export * from './core'
export * from './dom'
export * from './types'

import { Datastar } from './core'
import { BindingPlugins } from './plugins/attributes'
import { BackendActions, BackendPlugins } from './plugins/backend'
import { VisibilityPlugins } from './plugins/visibility'
import { Actions } from './types'

const start = performance.now()

const actions: Actions = Object.assign({}, BackendActions)
const plugins = [...BackendPlugins, ...BindingPlugins, ...VisibilityPlugins]
export const datastar = new Datastar(actions, ...plugins)

const end = performance.now()
console.log(`Datastar loaded in ${end - start}ms`)
