import { argsToMs, DATASTAR_CLASS_PREFIX } from '..'
import { toHTMLorSVGElement } from '../dom'
import { AttributeContext, AttributePlugin } from '../types'

const DISPLAY = 'display'
const NONE = 'none'
const IMPORTANT = 'important'
const DURATION = 'duration'

const SHOW = 'show'
const SHOW_CLASS = `${DATASTAR_CLASS_PREFIX}showing`
const HIDE_CLASS = `${DATASTAR_CLASS_PREFIX}hiding`

// Sets the display of the element
export const ShowPlugin: AttributePlugin = {
  prefix: SHOW,
  allowedModifiers: new Set([IMPORTANT, DURATION]),

  onLoad: (ctx: AttributeContext) => {
    const { el, modifiers, expressionFn, reactivity } = ctx

    const isImportant = modifiers.has(IMPORTANT)
    const priority = isImportant ? IMPORTANT : undefined

    let showFn, hideFn

    const durationArgs = ctx.modifiers.get(DURATION)
    if (durationArgs) {
      const style = document.createElement('style')
      document.head.appendChild(style)

      const durationMs = argsToMs(durationArgs)
      style.innerHTML = `
        .${SHOW_CLASS} {
          visibility: visible;
          transition: opacity ${durationMs}ms linear;
        }
        .${HIDE_CLASS} {
          visibility: hidden;
          transition: visibility 0s ${durationMs}ms, opacity ${durationMs}ms linear;
        }
      `

      const transitionEndHandler = (classNameToRemove: string) => (event: Event) => {
        if (event.target === el) {
          el.classList.remove(classNameToRemove)
          el.removeEventListener('transitionend', transitionEndHandler(classNameToRemove))
        }
      }

      showFn = () => {
        el.addEventListener('transitionend', transitionEndHandler(SHOW_CLASS))
        el.classList.add(SHOW_CLASS)
        el.style.setProperty('opacity', '1', priority)
      }

      hideFn = () => {
        el.addEventListener('transitionend', transitionEndHandler(HIDE_CLASS))
        el.classList.add(HIDE_CLASS)
        el.style.setProperty('opacity', '0', priority)
      }
    } else {
      showFn = () => {
        if (el.style.length === 1 && el.style.display === NONE) {
          el.style.removeProperty(DISPLAY)
        } else {
          el.style.setProperty(DISPLAY, '', priority)
        }
      }

      hideFn = () => {
        el.style.setProperty(DISPLAY, NONE, priority)
      }
    }

    return reactivity.effect(async () => {
      const expressionEvaluated = await expressionFn(ctx)
      const shouldShow = !!expressionEvaluated

      if (shouldShow) {
        showFn()
      } else {
        hideFn()
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
            delete ctx.el.dataset[ctx.rawKey]
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
    if (!(el instanceof HTMLTemplateElement)) {
      throw new Error(`el must be a template element`)
    }

    const target = document.querySelector(expression)
    if (!target) {
      throw new Error(`Target element not found: ${expression}`)
    }

    if (!el.content) {
      throw new Error('Template element must have content')
    }

    const n = el.content.cloneNode(true)
    const nEl = toHTMLorSVGElement(n as Element)
    if (nEl?.firstElementChild) {
      throw new Error('Empty template')
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
  mustHaveEmptyKey: true,
  mustHaveEmptyExpression: true,
  allowedModifiers: new Set([
    'smooth',
    'instant',
    'auto',
    'hstart',
    'hcenter',
    'hend',
    'hnearest',
    'vstart',
    'vcenter',
    'vend',
    'vnearest',
    'focus',
  ]),

  onLoad: ({ el, modifiers, rawKey }: AttributeContext) => {
    if (!el.tabIndex) el.setAttribute('tabindex', '0')
    const opts: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    }
    if (modifiers.has('smooth')) opts.behavior = 'smooth'
    if (modifiers.has('instant')) opts.behavior = 'instant'
    if (modifiers.has('auto')) opts.behavior = 'auto'
    if (modifiers.has('hstart')) opts.inline = 'start'
    if (modifiers.has('hcenter')) opts.inline = 'center'
    if (modifiers.has('hend')) opts.inline = 'end'
    if (modifiers.has('hnearest')) opts.inline = 'nearest'
    if (modifiers.has('vstart')) opts.block = 'start'
    if (modifiers.has('vcenter')) opts.block = 'center'
    if (modifiers.has('vend')) opts.block = 'end'
    if (modifiers.has('vnearest')) opts.block = 'nearest'

    scrollIntoView(el, opts, modifiers.has('focus'))
    delete el.dataset[rawKey]
    return () => {}
  },
}

export interface DocumentSupportingViewTransitionAPI {
  startViewTransition(updateCallback: () => Promise<void> | void): ViewTransition
}

export interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

export interface CSSStyleDeclaration {
  viewTransitionName: string
}

export const docWithViewTransitionAPI = document as unknown as DocumentSupportingViewTransitionAPI
export const supportsViewTransitions = !!docWithViewTransitionAPI.startViewTransition

// Setup view transition api
export const ViewTransitionPlugin: AttributePlugin = {
  prefix: 'viewTransition',
  onGlobalInit() {
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
  },
  onLoad: (ctx) => {
    if (!supportsViewTransitions) {
      console.error('Browser does not support view transitions')
      return
    }

    return ctx.reactivity.effect(() => {
      const { el, expressionFn } = ctx
      let name = expressionFn(ctx)
      if (!name) return

      const elVTASTyle = el.style as unknown as CSSStyleDeclaration
      elVTASTyle.viewTransitionName = name
    })
  },
}

export const VisibilityPlugins: AttributePlugin[] = [
  ShowPlugin,
  IntersectionPlugin,
  TeleportPlugin,
  ScrollIntoViewPlugin,
  ViewTransitionPlugin,
]

export const VisibilityActions = {
  scroll: async (
    _: AttributeContext,
    selector: string,
    opts: {
      behavior: 'smooth' | 'instant' | 'auto' // smooth is default
      vertical: 'start' | 'center' | 'end' | 'nearest' // center is default
      horizontal: 'start' | 'center' | 'end' | 'nearest' // center is default
      shouldFocus: boolean
    },
  ) => {
    const allOpts = Object.assign(
      { behavior: 'smooth', vertical: 'center', horizontal: 'center', shouldFocus: true },
      opts,
    )
    const el = document.querySelector(selector)
    scrollIntoView(el as HTMLElement, allOpts)
  },
}

function scrollIntoView(el: HTMLElement | SVGElement, opts: ScrollIntoViewOptions, shouldFocus = true) {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
    throw new Error('Element not found')
  }
  if (!el.tabIndex) el.setAttribute('tabindex', '0')

  el.scrollIntoView(opts)
  if (shouldFocus) el.focus()
}
