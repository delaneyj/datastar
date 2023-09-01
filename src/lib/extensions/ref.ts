import { NamespacedReactiveRecords, SIGNAL } from '..'
import { addDataExtension } from '../core'

const refRegexp = new RegExp(/(?<whole>\!(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)

export const REF = Symbol('ref')
export function addRefDataExtension() {
  addDataExtension(REF, {
    requiredExtensions: [SIGNAL],
    preprocessExpression: (str) => {
      // turn !ref into data.refs.signal.value <- Element
      const matches = [...str.matchAll(refRegexp)]
      for (const match of matches) {
        if (!match.groups) continue
        const { whole, ref } = match.groups
        str = str.replace(whole, `data.refs.${ref}.value`)
      }
      return str
    },
    withExpression: ({ el, name, reactivity: { signal } }) => {
      const elementData: NamespacedReactiveRecords = {
        refs: {
          [name]: signal(el),
        },
      }
      return elementData
    },
  })
}
