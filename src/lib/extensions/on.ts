import { NamespacedReactiveRecords, functionGenerator } from '..'
import { addDataExtension } from '../core'

export function addOnDataExtension() {
  addDataExtension('on', {
    withExpression: ({
      name,
      el,
      dataStack,
      expression,
      reactivity: { effect, onCleanup },
    }) => {
      const signalFn = functionGenerator(expression)
      const fn = () => signalFn(dataStack)

      el.addEventListener(name, fn)

      const elementData: NamespacedReactiveRecords = {
        on: {
          name: effect(() => {
            onCleanup(() => {
              el.removeEventListener(name, fn)
            })
          }),
        },
      }

      return elementData
    },
  })
}
