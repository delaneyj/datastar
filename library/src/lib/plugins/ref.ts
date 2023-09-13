import { NamespacedReactiveRecords, SIGNAL } from '..'
import { addDataPlugin } from '../core'

export const REF = 'ref'
export function addRefDataPlugin() {
  addDataPlugin(REF, {
    requiredPlugins: [SIGNAL],
    preprocessExpressions: [
      {
        name: 'ref',
        description: 'turns #ref into data.refs.ref.value',
        regexp: new RegExp(/(?<whole>\#(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
        replacer: ({ ref }) => `data.refs.${ref}.value`,
      },
    ],
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
