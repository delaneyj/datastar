import {
  NamespacedReactiveRecordCallback,
  NamespacedReactiveRecords,
} from './types'

export function functionGenerator<T>(
  str: string,
): NamespacedReactiveRecordCallback<T> {
  return Function(
    'data',
    `return ${str}`,
  ) as NamespacedReactiveRecordCallback<T>
}

export function functionEval(data: NamespacedReactiveRecords, str: string) {
  const fn = functionGenerator(str)
  return fn(data)
}
