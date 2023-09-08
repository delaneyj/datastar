import { SIGNAL } from '.'
import { functionEval } from '..'
import { addDataExtension } from '../core'

export const HEADER = 'header'
export function addHeadersExtension() {
  addDataExtension(HEADER, {
    requiredExtensions: [SIGNAL],
    withExpression: ({ name, expression, dataStack, actions, el, reactivity: { computed } }) => {
      const headers = functionEval(el, dataStack, actions, expression)
      if (typeof headers !== 'object') {
        throw new Error('Headers must be an object')
      }

      return {
        headers: {
          [name]: computed(() => headers),
        },
      }
    },
  })
}
