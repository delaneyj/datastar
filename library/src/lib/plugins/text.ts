import { NamespacedReactiveRecords, functionGenerator } from '..'
import { addDataPlugin } from '../core'

export const TEXT = 'text'
export function addTextDataPlugin() {
  addDataPlugin(TEXT, {
    withExpression: ({ name, el, expression, dataStack, actions, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        text: {
          [name]: effect(() => {
            if (!dataStack?.signals) return
            const res = signalFn(el, dataStack, actions)
            el.textContent = `${res}`
          }),
        },
      }

      return elementData
    },
  })
}
