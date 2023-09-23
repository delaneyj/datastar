import { toHTMLorSVGElement } from '../dom'
import { AttributeContext, AttributePlugin } from '../types'
import { reactivityPlugins } from './reactivity'
import { noArgs } from './shared'

export const DISPLAY = 'display'
export const NONE = 'none'
export const PREPEND = 'prepend'
export const APPEND = 'append'
export const INTERSECTS = 'intersects'
export const IMPORTANT = 'important'

export class ShowPlugin extends AttributePlugin {
  name = 'Show'
  description = 'Sets the display of the element'
  prefix = 'show'
  allowedModifiers = new Set([IMPORTANT])
  allowedModifierArgs = { [IMPORTANT]: noArgs }

  onMount({ el, expressionEvaluated, modifiers }: AttributeContext) {
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
  }
}

export const ONCE = 'once'
export const FULL = 'full'
export const HALF = 'half'

export class IntersectionAttributePlugin extends AttributePlugin {
  name = 'Intersection'
  prefix = INTERSECTS
  description = 'Sets the value of the element'
  requiredPluginTypes = reactivityPlugins
  allowedModifiers = new Set([ONCE, FULL, HALF])
  allowedModifierArgs = {
    [ONCE]: noArgs,
    [FULL]: noArgs,
    [HALF]: noArgs,
  }

  onMount({ modifiers, el, set, effect, cleanup }: AttributeContext) {
    const options = { threshold: 0 }
    if (modifiers.has(FULL)) options.threshold = 1
    else if (modifiers.has(HALF)) options.threshold = 0.5

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          set(INTERSECTS, true)
          if (modifiers.has(ONCE)) {
            observer.disconnect()
          }
        }
      })
    }, options)

    effect(() => {
      observer.observe(el)

      cleanup(() => observer.disconnect())
    })
  }
}

export class TeleportAttributePlugin extends AttributePlugin {
  name = 'Teleport'
  prefix = 'teleport'
  description = 'Teleports the element to another element'
  allowedModifiers = new Set([PREPEND, APPEND])
  allowedModifierArgs = {
    [PREPEND]: noArgs,
    [APPEND]: noArgs,
  }
  allowedTags = new Set(['template'])
  static parentErr = new Error('Target element must have a parent if using prepend or append')

  onMount({ el, modifiers, effect, expressionEvaluated }: AttributeContext) {
    if (!(el instanceof HTMLTemplateElement)) {
      throw new Error('Element must be a template')
    }

    effect(() => {
      if (typeof expressionEvaluated !== 'string') {
        throw new Error('Only string selectors are supported')
      }

      const target = document.querySelector(expressionEvaluated)
      if (!target) throw new Error(`Target element not found: ${expressionEvaluated}`)

      if (!el.content) {
        throw new Error('Template element must have content')
      }

      const n = el.content.cloneNode(true)
      const nEl = toHTMLorSVGElement(n as Element)
      if (nEl?.firstElementChild) throw new Error('Empty template')

      if (modifiers.has(PREPEND)) {
        if (!target.parentNode) throw TeleportAttributePlugin.parentErr
        target.parentNode.insertBefore(n, target)
      } else if (modifiers.has(APPEND)) {
        if (!target.parentNode) throw TeleportAttributePlugin.parentErr
        target.parentNode.insertBefore(n, target.nextSibling)
      } else {
        target.appendChild(n)
      }
    })
  }
}
