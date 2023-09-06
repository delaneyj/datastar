import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataExtension } from '../core'

const IMPORTANT = 'important',
  DISPLAY = 'display',
  NONE = 'none'

export const SHOW = 'show'
export function addShowDataExtension() {
  addDataExtension(SHOW, {
    requiredExtensions: [SIGNAL],
    allowedModifiers: [IMPORTANT],
    withExpression: ({ el, name, dataStack, expression, hasMod, reactivity: { effect }, actions }) => {
      const signalFn = functionGenerator(expression)

      if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
        throw new Error('Element must have a style property')
      }

      const isImportant = hasMod(IMPORTANT)
      const priority = isImportant ? IMPORTANT : undefined

      const elementData: NamespacedReactiveRecords = {
        show: {
          [name]: effect(() => {
            const shouldShow = !!signalFn(el, dataStack, actions)
            if (shouldShow) {
              if (el.style.length === 1 && el.style.display === NONE) {
                el.style.removeProperty(DISPLAY)
              } else {
                el.style.setProperty(DISPLAY, '', priority)
              }
            } else {
              el.style.setProperty(DISPLAY, NONE, priority)
            }
          }),
        },
      }

      return elementData
    },
  })
}
