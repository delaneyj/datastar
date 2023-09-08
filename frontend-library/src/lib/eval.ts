import { ActionsMap, NamespacedReactiveRecordCallback, NamespacedReactiveRecords } from './types'

export function functionGenerator<T>(str: string): NamespacedReactiveRecordCallback<T> {
  const fnContents = `return ${str}`
  const fn = new Function('el', 'dataStack', 'actions', fnContents)
  return fn as NamespacedReactiveRecordCallback<T>
}

export function functionEval(el: Element, dataStack: NamespacedReactiveRecords, actions: ActionsMap, str: string) {
  const fn = functionGenerator(str)
  try {
    return fn(el, dataStack, actions)
  } catch (e) {
    console.error(`Error evaluating expression: ${str}`)
  }
}

export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}
