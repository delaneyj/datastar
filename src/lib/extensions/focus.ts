import { SIGNAL } from '.'
import { addDataExtension, toHTMLorSVGElement } from '../core'

export const FOCUS = 'focus'
export function addFocusDataExtension() {
  addDataExtension(FOCUS, {
    requiredExtensions: [SIGNAL],
    withExpression: ({ el }) => {
      const element = toHTMLorSVGElement(el)
      if (!element?.focus) throw new Error('Element must have a focus method')
      element.focus()
      return {}
    },
  })
}
