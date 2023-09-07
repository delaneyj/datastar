import { SIGNAL } from '.'
import { addDataExtension, uniqueId } from '../core'

export const MODEL = 'model'
const updateEvents = ['change', 'input', 'keydown']
export function addModelDataExtension() {
  addDataExtension(MODEL, {
    allowedTags: ['input', 'textarea', 'select'],
    requiredExtensions: [SIGNAL],

    withExpression: ({ name, el, expression, dataStack, reactivity: { effect, onCleanup } }) => {
      const signal = dataStack.signals[expression]
      if (!signal) {
        throw new Error(`Signal ${expression} not found`)
      }

      if (!('value' in el)) throw new Error('Element must have a value property')
      el.value = signal.value

      const setter = () => {
        const current = signal.value
        if (typeof current === 'number') {
          signal.value = Number(el.value)
        } else if (typeof current === 'string') {
          signal.value = el.value
        } else if (typeof current === 'boolean') {
          signal.value = Boolean(el.value)
        } else {
          throw new Error('Unsupported type')
        }
      }

      return {
        model: {
          [`${name}-${uniqueId()}`]: effect(() => {
            el.value = signal.value

            for (const event of updateEvents) {
              el.addEventListener(event, setter)
            }

            onCleanup(() => {
              for (const event of updateEvents) {
                el.removeEventListener(event, setter)
              }
            })
          }),
        },
      }
    },
  })
}
