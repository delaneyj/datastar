import { AttributeContext, HTMLorSVGElement } from './types'

export function toHTMLorSVGElement(node: Node): HTMLorSVGElement | null {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return null
  }
  return node
}

export function walkDownDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.firstElementChild

  while (el) {
    walkDownDOM(el, callback)
    el = el.nextElementSibling
  }
}

export function functionGenerator(str: string): Function {
  const fnContents = `return ${str}`
  const fn = new Function('ctx', fnContents)
  return fn
}

export function functionEval(ctx: AttributeContext) {
  const expression = ctx.expressionRaw
  const fn = functionGenerator(expression)
  try {
    ctx.expressionEvaluated = fn(ctx)
  } catch (e) {
    console.error(`Error evaluating expression:\n${expression}`)
    throw e
  }
}
