import { functionEval } from '..'
import { addDataExtension } from '../core'

const signalRexep = new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)

const persistKey = 'persist'
export function addSignalDataExtension() {
  addDataExtension('signal', {
    preprocessExpression: (str) => {
      // turn $signal into data.signals.signal.value
      const matches = [...str.matchAll(signalRexep)]
      console.log({ matches })
      for (const match of matches) {
        if (!match.groups) continue
        const { whole, signal } = match.groups
        str = str.replace(whole, `data.signals.${signal}.value`)
      }
      return str
    },
    allowedModifiers: [persistKey],
    withExpression: ({ name, expression, reactivity, hasMod }) => {
      const signal = reactivity.signal(functionEval({}, expression))

      if (hasMod(persistKey)) {
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
