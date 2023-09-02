import { SIGNAL } from '.'
import { functionEval } from '..'
import { addDataExtension } from '../core'

export const HEADER = Symbol('header')
export function addHeadersExtension() {
  addDataExtension(HEADER, {
    requiredExtensions: [SIGNAL],
    withExpression: ({ name, expression, dataStack, reactivity: { computed } }) => {
      const headers = functionEval(dataStack, expression)
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
