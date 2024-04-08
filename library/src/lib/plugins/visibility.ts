import { DATASTAR_ERROR } from '..'
import { toHTMLorSVGElement } from '../dom'
import { AttributeContext, AttributePlugin } from '../types'

const DISPLAY = 'display'
const NONE = 'none'
const IMPORTANT = 'important'

// Sets the display of the element
export const ShowPlugin: AttributePlugin = {
  prefix: 'show',
  allowedModifiers: new Set([IMPORTANT]),

  onLoad: (ctx: AttributeContext) => {
    const { el, modifiers, expressionFn, reactivity } = ctx

    return reactivity.effect(() => {
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

// Run expression when element intersects with viewport
export const IntersectionPlugin: AttributePlugin = {
  prefix: INTERSECTS,
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
// Teleports the element to another element
export const TeleportPlugin: AttributePlugin = {
  prefix: 'teleport',
  allowedModifiers: new Set([PREPEND, APPEND]),
  allowedTagRegexps: new Set(['template']),
  bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    const { el, modifiers, expression } = ctx
    if (!(el instanceof HTMLTemplateElement)) throw DATASTAR_ERROR // type guard

    const target = document.querySelector(expression)
    if (!target) {
      // throw new Error(`Target element not found: ${expression}`)
      throw DATASTAR_ERROR
    }

    if (!el.content) {
      // throw new Error('Template element must have content')
      throw DATASTAR_ERROR
    }

    const n = el.content.cloneNode(true)
    const nEl = toHTMLorSVGElement(n as Element)
    if (nEl?.firstElementChild) {
      // throw new Error('Empty template')
      throw DATASTAR_ERROR
    }

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

// Scrolls the element into view
export const ScrollIntoViewPlugin: AttributePlugin = {
  prefix: 'scrollIntoView',
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
// Setup view transition api
export const ViewTransitionPlugin: AttributePlugin = {
  prefix: 'viewTransition',
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
      viewTransitionRefCounts: {},
    })
  },
  onLoad: (ctx: AttributeContext) => {
    const { el, expressionFn } = ctx
    let name = expressionFn(ctx)
    if (!name) {
      if (!el.id) {
        // throw new Error('Element must have an id if no name is provided')
        throw DATASTAR_ERROR
      }
      name = el.id
    }

    const stylesheet = document.getElementById(viewTransitionID) as HTMLStyleElement
    if (!stylesheet) {
      // throw new Error('View transition stylesheet not found')
      throw DATASTAR_ERROR
    }

    const clsName = `ds-vt-${name}`
    // add view transition class
    const vtCls = `
.${clsName} {
  view-transition: ${name};
}

`
    stylesheet.innerHTML += vtCls
    const s = ctx.store()
    let count = s.viewTransitionRefCounts[name]
    if (!count) {
      count = ctx.reactivity.signal(0)
      s.viewTransitionRefCounts[name] = count
    }
    count.value++

    // add class to element
    el.classList.add(clsName)

    return () => {
      count.value--
      if (count.value === 0) {
        delete s.viewTransitionRefCounts[name]
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
