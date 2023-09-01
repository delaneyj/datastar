import { NamespacedReactiveRecords, functionGenerator } from '..'
import { addDataExtension } from '../core'

export function addBindDataExtension() {
  addDataExtension('bind', {
    withExpression: ({ el, name, expression, dataStack, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        bind: {
          [name]: effect(() => {
            if (!dataStack?.signals) return
            const res = signalFn(dataStack)
            el.setAttribute(name, `${res}`)
          }),
        },
      }

      return elementData
    },
  })
}
