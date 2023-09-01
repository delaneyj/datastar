import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataExtension } from '../core'

export const BIND = Symbol('bind')
export function addBindDataExtension() {
  addDataExtension(BIND, {
    requiredExtensions: [SIGNAL],
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
