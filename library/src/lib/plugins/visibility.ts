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
  allowedTagRegexps: new Set(['template']),
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

const viewTransitionID = 'ds-view-transition-stylesheet'
export const ViewTransitionPlugin: AttributePlugin = {
  prefix: 'viewTransition',
  description: 'Setup view transition api',
  onGlobalInit(ctx) {
    const viewTransitionStylesheet = document.createElement('style')
    viewTransitionStylesheet.id = viewTransitionID
    document.head.appendChild(viewTransitionStylesheet)

    let hasViewTransitionMeta = false
    document.head.childNodes.forEach((node) => {
      if (node instanceof HTMLMetaElement && node.name === 'view-transition') {
        hasViewTransitionMeta = true
      }
    })

    if (!hasViewTransitionMeta) {
      const meta = document.createElement('meta')
      meta.name = 'view-transition'
      meta.content = 'same-origin'
      document.head.appendChild(meta)
    }

    ctx.mergeStore({
      viewTransitions: {},
    })
  },
  onLoad: (ctx: AttributeContext) => {
    const { el, expressionFn, store } = ctx
    let name = expressionFn(ctx)
    if (!name) {
      if (!el.id) throw new Error('Element must have an id if no name is provided')
      name = el.id
    }

    const stylesheet = document.getElementById(viewTransitionID) as HTMLStyleElement
    if (!stylesheet) throw new Error('View transition stylesheet not found')

    const clsName = `ds-vt-${name}`
    // add view transition class
    const vtCls = `
.${clsName} {
  view-transition: ${name};
}

`
    stylesheet.innerHTML += vtCls
    let count = store.viewTransitions[name]
    if (!count) {
      count = ctx.reactivity.signal(0)
      store.viewTransitions[name] = count
    }
    count.value++

    // add class to element
    el.classList.add(clsName)

    return () => {
      count.value--
      if (count.value === 0) {
        delete store.viewTransitions[name]
        stylesheet.innerHTML = stylesheet.innerHTML.replace(vtCls, '')
      }
    }
  },
}

export const VisibilityPlugins: AttributePlugin[] = [
  ShowPlugin,
  IntersectionPlugin,
  TeleportPlugin,
  ScrollIntoViewPlugin,
  ViewTransitionPlugin,
]
