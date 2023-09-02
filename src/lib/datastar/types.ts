import { Reactive } from '@reactively/core'

export type Reactivity = {
  signal<T>(initialValue: T): Reactive<T>
  computed<T>(fn: () => T): Reactive<T>
  effect(fn: () => void): Reactive<void>
  onCleanup(fn: () => void): void
}
export type ReactiveRecord = Record<string, Reactive<any>>
export type NamespacedReactiveRecords = Record<string, ReactiveRecord>
export type NamespacedReactiveRecordCallback<T> = (data: NamespacedReactiveRecords) => T
export type Modifier = {
  label: string
  args: string[]
}
