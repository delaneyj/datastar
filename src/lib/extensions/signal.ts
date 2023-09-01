import { functionEval } from '..'
import { addDataExtension } from '../core'

const signalRexep = new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)

const PERSIST_KEY = 'persist'

export const SIGNAL = Symbol('signal')
export function addSignalDataExtension() {
  const dataSignalPrefix = `data.${SIGNAL.description}s`
  addDataExtension(SIGNAL, {
    preprocessExpression: (str) => {
      // turn $signal into data.signals.signal.value
      const matches = [...str.matchAll(signalRexep)]
      for (const match of matches) {
        if (!match.groups) continue
        const { whole, signal } = match.groups
        str = str.replace(whole, `${dataSignalPrefix}.${signal}.value`)
      }
      return str
    },
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
