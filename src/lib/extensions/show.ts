import { NamespacedReactiveRecords, functionGenerator } from '..'
import { addDataExtension } from '../core'

export function addShowDataExtension() {
  addDataExtension('show', {
    allowedModifiers: ['important'],
    withExpression: ({ el, dataStack, expression, modifiers, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
        throw new Error('Element must have a style property')
      }

      const isImportant = modifiers?.has('important')
      const priority = isImportant ? 'important' : undefined

      const elementData: NamespacedReactiveRecords = {
        show: {
          name: effect(() => {
            const shouldShow = !!signalFn(dataStack)
            if (shouldShow) {
              if (el.style.length === 1 && el.style.display === 'none') {
                el.style.removeProperty('display')
              } else {
                el.style.setProperty('display', '', priority)
              }
            } else {
              el.style.setProperty('display', 'none', priority)
            }
          }),
        },
      }

      return elementData
    },
  })
}
