import { HTMLorSVGElement } from './types'

export function toHTMLorSVGElement(node: Node): HTMLorSVGElement | null {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return null
  }
  return node
}
