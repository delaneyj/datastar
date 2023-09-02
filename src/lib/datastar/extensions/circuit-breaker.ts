import { SIGNAL } from '.'
import { functionEval } from '..'
import { addDataExtension } from '../core'

export const CIRCUIT_BREAKER = Symbol('circuit-breaker')
export function addCircuitBreakerDataExtension() {
  addDataExtension(CIRCUIT_BREAKER, {
    requiredExtensions: [SIGNAL],

    withExpression: ({ name, expression, dataStack, reactivity: { computed } }) => {
      return {
        circuitBreaker: {
          [name]: computed(() => functionEval(dataStack, expression)),
        },
      }
    },
  })
}
