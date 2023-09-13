import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataPlugin, toHTMLorSVGElement } from '../core'

const PREPEND = 'prepend',
  APPEND = 'append',
  MUST_PARENT_ERR = 'Target element must have a parent if using prepend or append'

export const TELEPORT = 'teleport'
export function addTeleportDataPlugin() {
  addDataPlugin(TELEPORT, {
    requiredPlugins: [SIGNAL],
    allowedModifiers: [PREPEND, APPEND],
    withExpression: ({ name, el, expression, dataStack, reactivity: { effect }, hasMod, actions }) => {
      if (!(el instanceof HTMLTemplateElement)) {
        throw new Error('Element must be a template')
      }

      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        text: {
          [name]: effect(() => {
            const res = signalFn(el, dataStack, actions)
            if (typeof res !== 'string') throw new Error('Selector must be a string')
            const target = document.querySelector(res)
            if (!target) throw new Error(`Target element not found: ${res}`)

            if (!el.content) throw new Error('Template element must have content')
            const n = el.content.cloneNode(true)
            const nEl = toHTMLorSVGElement(n as Element)
            if (nEl?.firstElementChild) throw new Error('Empty template')

            if (hasMod(PREPEND)) {
              if (!target.parentNode) throw new Error(MUST_PARENT_ERR)
              target.parentNode.insertBefore(n, target)
            } else if (hasMod(APPEND)) {
              if (!target.parentNode) throw new Error(MUST_PARENT_ERR)
              target.parentNode.insertBefore(n, target.nextSibling)
            } else {
              target.appendChild(n)
            }
            target.appendChild(n)
          }),
        },
      }

      return elementData
    },
  })
}
