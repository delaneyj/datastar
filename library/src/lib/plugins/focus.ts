import { SIGNAL } from '.'
import { addDataPlugin, toHTMLorSVGElement } from '../core'

export const FOCUS = 'focus'
export function addFocusDataPlugin() {
  addDataPlugin(FOCUS, {
    requiredPlugins: [SIGNAL],
    withExpression: ({ el }) => {
      const element = toHTMLorSVGElement(el)
      if (!element?.focus) throw new Error('Element must have a focus method')
      element.focus()
      return {}
    },
  })
}
