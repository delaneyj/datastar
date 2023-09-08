import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataExtension } from '../core'

export const BIND = 'bind'
export function addBindDataExtension() {
  addDataExtension(BIND, {
    requiredExtensions: [SIGNAL],
    withExpression: ({ el, name, expression, dataStack, actions, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        bind: {
          [name]: effect(() => {
            if (!dataStack?.signals) return
            const res = signalFn(el, dataStack, actions)
            el.setAttribute(name, `${res}`)
          }),
        },
      }

      return elementData
    },
  })
}
