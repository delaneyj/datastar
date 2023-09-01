import { NamespacedReactiveRecords } from '..'
import { addDataExtension } from '../core'

const refRegexp = new RegExp(/(?<whole>\!(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)

export function addRefDataExtension() {
  addDataExtension('ref', {
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
