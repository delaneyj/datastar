import { functionEval } from '..'
import { addDataExtension } from '../core'

export const SIGNAL = Symbol('signal')

const PERSIST_KEY = 'persist'
export function addSignalDataExtension() {
  addDataExtension(SIGNAL, {
    preprocessExpressions: [
      {
        name: 'signal',
        description: 'turns $signal into data.signals.signal.value',
        regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ signal }) => `data.${SIGNAL.description}s.${signal}.value`,
      },
      {
        name: 'action',
        description: 'turns @action(args) into actions.action(args)',
        regexp: new RegExp(/(?<whole>\@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*))\((?<args>.*)\)/g),
        replacer: ({ action, args }) => `actions.${action}(${args})`,
      },
    ],
    allowedModifiers: [PERSIST_KEY],
    withExpression: ({ name, expression, reactivity, hasMod }) => {
      const signal = reactivity.signal(functionEval({}, expression))

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
