import { functionEval } from '..'
import { addDataExtension } from '../core'
import { ACTION } from './actions'

export const SIGNAL = 'signal'

const PERSIST_KEY = 'persist'
export function addSignalDataExtension() {
  addDataExtension(SIGNAL, {
    requiredExtensions: [ACTION],
    preprocessExpressions: [
      {
        name: 'signal',
        description: 'turns $signal into dataStack.signals.signal.value',
        regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ signal }) => `dataStack.${SIGNAL}s.${signal}.value`,
      },
    ],
    allowedModifiers: [PERSIST_KEY],
    withExpression: ({ name, el, expression, reactivity, hasMod, actions }) => {
      const signal = reactivity.signal(functionEval(el, {}, actions, expression))

      if (hasMod(PERSIST_KEY)) {
        const value = localStorage.getItem(name)
        if (value) {
          const parsedValue = JSON.parse(value)
          signal.value = parsedValue
        }

        reactivity.effect(() => {
          const value = JSON.stringify(signal.value)
          localStorage.setItem(name, value)
        })
      }

      return {
        signals: {
          [name]: signal,
        },
      }
    },
  })
}
