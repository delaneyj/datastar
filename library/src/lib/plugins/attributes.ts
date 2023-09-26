import { Signal } from '../external/preact-core'
import { AttributeContext, AttributePlugin } from '../types'

const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())

export const BindAttributePlugin: AttributePlugin = {
  prefix: 'bind',
  description: 'Sets the value of the element',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx: AttributeContext) => {
    return ctx.reactivity.effect(() => {
      const key = kebabize(ctx.key)
      const value = ctx.expressionFn(ctx)
      ctx.el.setAttribute(key, `${value}`)
    })
  },
}

const updateModelEvents = ['change', 'input', 'keydown']
export const TwoWayBindingModelPlugin: AttributePlugin = {
  prefix: 'model',
  description: 'Sets the value of the element',
  mustHaveEmptyKey: true,
  allowedTags: new Set(['input', 'textarea', 'select']),
  bypassExpressionFunctionCreation: true,
  onLoad: (ctx: AttributeContext) => {
    const { store, el, expression: expressionRaw } = ctx
    const signal = store[expressionRaw] as Signal<any>

    return ctx.reactivity.effect(() => {
      if (!('value' in el)) throw new Error('Element does not have value property')
      el.value = `${signal.value}`
      const setter = () => {
        const current = signal.value
        if (typeof current === 'number') {
          signal.value = Number(el.value)
        } else if (typeof current === 'string') {
          signal.value = el.value
        } else if (typeof current === 'boolean') {
          signal.value = Boolean(el.value)
        } else {
          throw new Error('Unsupported type')
        }
      }

      setter()

      updateModelEvents.forEach((event) => {
        el.addEventListener(event, setter)
      })

      return () => {
        updateModelEvents.forEach((event) => {
          el.removeEventListener(event, setter)
        })
      }
    })
  },
}

export const TextPlugin: AttributePlugin = {
  prefix: 'text',
  description: 'Sets the textContent of the element',
  mustHaveEmptyKey: true,

  onLoad: (ctx: AttributeContext) => {
    const { el, expressionFn } = ctx
    if (!(el instanceof HTMLElement)) throw new Error('Element is not HTMLElement')
    return ctx.reactivity.effect(() => {
      el.textContent = `${expressionFn(ctx)}`
    })
  },
}

export const EventPlugin: AttributePlugin = {
  prefix: 'on',
  description: 'Sets the event listener of the element',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx: AttributeContext) => {
    const { el, key, expressionFn } = ctx
    if (!(el instanceof HTMLElement)) throw new Error('Element is not HTMLElement')
    const callback = () => {
      expressionFn(ctx)
    }
    const eventType = key.toLowerCase()
    el.addEventListener(eventType, callback)
    return () => {
      el.removeEventListener(eventType, callback)
    }
  },
}

export const FocusPlugin: AttributePlugin = {
  prefix: 'focus',
  description: 'Sets the focus of the element',
  mustHaveEmptyKey: true,
  mustHaveEmptyExpression: true,

  onLoad: (ctx: AttributeContext) => {
    if (!ctx.el.tabIndex) {
      ctx.el.setAttribute('tabindex', '0')
    }
    ctx.el.focus()
    ctx.el.scrollIntoView({ block: 'center', inline: 'center' })
    return () => ctx.el.blur()
  },
}

export const BindingPlugins: AttributePlugin[] = [
  BindAttributePlugin,
  TwoWayBindingModelPlugin,
  TextPlugin,
  EventPlugin,
  FocusPlugin,
]
