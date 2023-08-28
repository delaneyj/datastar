import { NamespacedReactiveRecords, functionGenerator } from '..'
import { addDataExtension } from '../core'

export function addTextDataExtension() {
  addDataExtension('text', {
    withExpression: ({ el, expression, dataStack, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        text: {
          name: effect(() => {
            if (!dataStack?.signals) return
            const res = signalFn(dataStack)
            el.textContent = `${res}`
          }),
        },
      }

      return elementData
    },
  })
}
