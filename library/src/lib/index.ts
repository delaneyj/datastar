// function mergeActions<T extends unknown[]>(...actions: T): UnionToIntersection<T[number]> {
//   const all = {}
//   for (const action of actions) {
//     Object.assign(all, action)
//   }
//   return all as UnionToIntersection<T[number]>
// }

import { Datastar } from './core'
import { ActionRunePlugin } from './plugins/actions'
import {
  FetchAttributePlugin,
  FetchDeleteActionPlugin,
  FetchGetActionPlugin,
  FetchPatchActionPlugin,
  FetchPostActionPlugin,
  FetchPutActionPlugin,
} from './plugins/backend'
import {
  BindAttributePlugin,
  EventListenerAttributePlugin,
  ModelAttributePlugin,
  RefAttributePlugin,
  RefRunePlugin,
  TextNodeAttributePlugin,
} from './plugins/binding'
import {
  ComputedAttributePlugin,
  EffectAttributePlugin,
  ReactivityRunePlugin,
  SignalAttributePlugin,
} from './plugins/reactivity'
import { IntersectionAttributePlugin, ShowPlugin, TeleportAttributePlugin } from './plugins/visibility'

const ds = new Datastar(
  ActionRunePlugin,
  ReactivityRunePlugin,
  RefRunePlugin,
  SignalAttributePlugin,
  ComputedAttributePlugin,
  EffectAttributePlugin,
  BindAttributePlugin,
  RefAttributePlugin,
  ModelAttributePlugin,
  EventListenerAttributePlugin,
  TextNodeAttributePlugin,
  ShowPlugin,
  IntersectionAttributePlugin,
  TeleportAttributePlugin,
  FetchAttributePlugin,
  FetchGetActionPlugin,
  FetchPostActionPlugin,
  FetchPatchActionPlugin,
  FetchPutActionPlugin,
  FetchDeleteActionPlugin,
)
ds.run()
