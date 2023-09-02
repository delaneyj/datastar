import { NamespacedReactiveRecords, SIGNAL } from '..'
import { addDataExtension } from '../core'

export const REF = Symbol('ref')
export function addRefDataExtension() {
  addDataExtension(REF, {
    requiredExtensions: [SIGNAL],
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
