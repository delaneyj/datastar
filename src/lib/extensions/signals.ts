import { functionEval } from '..'
import { addDataExtension } from '../core'

const signalRexep = new RegExp(
  /(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g,
)

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
    withExpression: ({ name, expression, reactivity }) => {
      return {
        signals: {
          [name]: reactivity.signal(functionEval({}, expression)),
        },
      }
    },
  })
}
