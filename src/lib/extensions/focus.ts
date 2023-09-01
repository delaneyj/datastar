import { addDataExtension, toHTMLorSVGElement } from '../core'

export function addFocusDataExtension() {
  addDataExtension('focus', {
    withExpression: ({ el }) => {
      const element = toHTMLorSVGElement(el)
      if (!element?.focus) throw new Error('Element must have a focus method')
      element.focus()
      return {}
    },
  })
}
