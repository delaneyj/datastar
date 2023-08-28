import { Reactive } from '@reactively/core'

export type ReactiveRecord = Record<string, Reactive<any>>
export type NamespacedReactiveRecords = Record<string, ReactiveRecord>
export type NamespacedReactiveRecordCallback<T> = (
  data: NamespacedReactiveRecords,
) => T
