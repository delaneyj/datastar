import { toHTMLorSVGElement } from '../dom'
import { effect } from '../external/preact-core'
import { AttributeContext, AttributePlugin } from '../types'

const DISPLAY = 'display'
const NONE = 'none'
const IMPORTANT = 'important'

export const ShowPlugin: AttributePlugin = {
  prefix: 'show',
  description: 'Sets the display of the element',
  allowedModifiers: new Set([IMPORTANT]),

  onLoad: (ctx: AttributeContext) => {
    const { el, modifiers, expressionFn } = ctx

    return effect(() => {
      const expressionEvaluated = expressionFn(ctx)
      const shouldShow = !!expressionEvaluated

      const isImportant = modifiers.has(IMPORTANT)
      const priority = isImportant ? IMPORTANT : undefined

      if (shouldShow) {
        if (el.style.length === 1 && el.style.display === NONE) {
          el.style.removeProperty(DISPLAY)
        } else {
          el.style.setProperty(DISPLAY, '', priority)
        }
      } else {
        el.style.setProperty(DISPLAY, NONE, priority)
      }
    })
  },
}

const INTERSECTS = 'intersects'
const ONCE = 'once'
const HALF = 'half'
const FULL = 'full'

export const IntersectionPlugin: AttributePlugin = {
  prefix: INTERSECTS,
  description: `Run expression when element intersects with viewport`,
  allowedModifiers: new Set([ONCE, HALF, FULL]),
  mustHaveEmptyKey: true,
  onLoad: (ctx: AttributeContext) => {
    const { modifiers } = ctx
    const options = { threshold: 0 }
    if (modifiers.has(FULL)) options.threshold = 1
    else if (modifiers.has(HALF)) options.threshold = 0.5

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ctx.expressionFn(ctx)
          if (modifiers.has(ONCE)) {
            observer.disconnect()
          }
        }
      })
    }, options)

    observer.observe(ctx.el)
    return () => observer.disconnect()
  },
}

const PREPEND = 'prepend'
const APPEND = 'append'
const teleportParentErr = new Error('Target element must have a parent if using prepend or append')
export const TeleportPlugin: AttributePlugin = {
  prefix: 'teleport',
  description: 'Teleports the element to another element',
  allowedModifiers: new Set([PREPEND, APPEND]),
  allowedTags: new Set(['template']),
  bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    const { el, modifiers, expression } = ctx
    if (!(el instanceof HTMLTemplateElement)) throw new Error() // type guard

    const target = document.querySelector(expression)
    if (!target) throw new Error(`Target element not found: ${expression}`)

    if (!el.content) {
      throw new Error('Template element must have content')
    }

    const n = el.content.cloneNode(true)
    const nEl = toHTMLorSVGElement(n as Element)
    if (nEl?.firstElementChild) throw new Error('Empty template')

    if (modifiers.has(PREPEND)) {
      if (!target.parentNode) throw teleportParentErr
      target.parentNode.insertBefore(n, target)
    } else if (modifiers.has(APPEND)) {
      if (!target.parentNode) throw teleportParentErr
      target.parentNode.insertBefore(n, target.nextSibling)
    } else {
      target.appendChild(n)
    }
  },
}

export const ScrollIntoViewPlugin: AttributePlugin = {
  prefix: 'scrollIntoView',
  description: 'Scrolls the element into view',
  onLoad: (ctx: AttributeContext) => {
    const { el } = ctx
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  },
}

export const VisibilityPlugins: AttributePlugin[] = [
  ShowPlugin,
  IntersectionPlugin,
  TeleportPlugin,
  ScrollIntoViewPlugin,
]
