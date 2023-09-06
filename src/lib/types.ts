import { Reactive } from './external/reactively'

export type Reactivity = {
  signal<T>(initialValue: T): Reactive<T>
  computed<T>(fn: () => T): Reactive<T>
  effect(fn: () => void): Reactive<void>
  onCleanup(fn: () => void): void
}

export type WithExpressionArgs = {
  name: string
  expression: string
  el: Element
  dataStack: NamespacedReactiveRecords
  reactivity: Reactivity
  withMod(label: string): Modifier | undefined
  hasMod(label: string): boolean
  actions: ActionsMap
}

export type ReactiveRecord = Record<string, Reactive<any>>
export type NamespacedReactiveRecords = Record<string, ReactiveRecord>
export type ActionFn = (args: WithExpressionArgs) => Promise<void>
export type ActionsMap = Record<string, ActionFn>
export type NamespacedReactiveRecordCallback<T> = (
  el: Element,
  data: NamespacedReactiveRecords,
  actions: ActionsMap,
) => T
export type Modifier = {
  label: string
  args: string[]
}

export interface ActionArgs {
  el: Element
  dataStack: NamespacedReactiveRecords
  actions: ActionsMap
}
