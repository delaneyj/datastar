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
      const v = `${value}`
      if (!v || v === 'false' || v === 'null' || v === 'undefined') {
        ctx.el.removeAttribute(key)
      } else {
        ctx.el.setAttribute(key, v)
      }
    })
  },
}

const dataURIRegex = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/
const updateModelEvents = ['change', 'input', 'keydown']
export const TwoWayBindingModelPlugin: AttributePlugin = {
  prefix: 'model',
  description: 'Sets the value of the element',
  mustHaveEmptyKey: true,
  allowedTagRegexps: new Set(['input', 'textarea', 'select', 'checkbox']),
  bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    const { store, el, expression: expressionRaw } = ctx
    const signal = store[expressionRaw] as Signal<any>

    return ctx.reactivity.effect(() => {
      const isInput = el.tagName.toLowerCase().includes('input')
      const isSelect = el.tagName.toLowerCase().includes('select')
      const type = el.getAttribute('type')

      if (!isInput && !isSelect) {
        throw new Error('Element must be input or select')
      }

      const isCheckbox = isInput && type === 'checkbox'
      const isFile = isInput && type === 'file'
      if (!signal) throw new Error(`Signal ${expressionRaw} not found`)
      if (isCheckbox) {
        el.setAttribute('checked', signal.value)
      } else if (isFile) {
        // console.warn('File input reading is not supported yet')
      } else {
        el.setAttribute('value', `${signal.value}`)
      }
      const setter = () => {
        const value = (el as any).value
        if (typeof value === 'undefined') return

        if (isFile) {
          const [f] = (el as any)?.files || []
          if (!f) {
            signal.value = ''
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result !== 'string') throw new Error('Unsupported type')

            const match = reader.result.match(dataURIRegex)
            if (!match?.groups) throw new Error('Invalid data URI')
            const { mime, contents } = match.groups
            signal.value = contents

            const mimeName = `${expressionRaw}Mime`
            if (mimeName in store) {
              const mimeSignal = store[`${mimeName}`] as Signal<string>
              mimeSignal.value = mime
            }
          }
          reader.readAsDataURL(f)

          const nameName = `${expressionRaw}Name`
          if (nameName in store) {
            const nameSignal = store[`${nameName}`] as Signal<string>
            nameSignal.value = f.name
          }

          return
        } else {
          const current = signal.value
          if (typeof current === 'number') {
            signal.value = Number(value)
          } else if (typeof current === 'string') {
            signal.value = value
          } else if (typeof current === 'boolean') {
            if (isCheckbox) {
              signal.value = el.getAttribute('checked') === 'true'
            } else {
              signal.value = Boolean(value)
            }
          } else if (typeof current === 'undefined') {
          } else {
            console.log(typeof current)
            debugger
            throw new Error('Unsupported type')
          }
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

// export const PromptPlugin: AttributePlugin = {
//   prefix: 'prompt',
//   description: 'Sets the textContent of the element',
//   preprocessors: new Set([
//     {
//       name: 'PromptPreprocessor',
//       description: `Replacing prompt() with ctx.store.prompt`,
//       regexp: /(?<whole>(?<signal>[^;]*);(?<label>.*))/gm,
//       replacer: ({ signal, label }: RegexpGroups) =>
//         `
//           const v = prompt(\`${label}\`, ctx.store.${signal}.value);
//           if (v && v !== ctx.store.${signal}.value) {
//             ctx.store.${signal}.value = v
//           };
//           v
//         `,
//     },
//   ]),
//   onLoad: (ctx: AttributeContext) => {
//     ctx.expressionFn(ctx)
//   },
// }

export const EventPlugin: AttributePlugin = {
  prefix: 'on',
  description: 'Sets the event listener of the element',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,
  allowedModifiers: new Set(['once', 'passive', 'capture', 'debounce', 'throttle']),

  onLoad: (ctx: AttributeContext) => {
    const { el, key, expressionFn } = ctx
    let callback = () => {
      expressionFn(ctx)
    }

    const debounceArgs = ctx.modifiers.get('debounce')
    if (debounceArgs) {
      const wait = argsToMs(debounceArgs)
      const leading = argsHas(debounceArgs, 'leading', false)
      const trailing = argsHas(debounceArgs, 'noTrail', true)
      callback = debounce(callback, wait, leading, trailing)
    }

    const throttleArgs = ctx.modifiers.get('throttle')
    if (throttleArgs) {
      const wait = argsToMs(throttleArgs)
      const leading = argsHas(throttleArgs, 'noLead', true)
      const trailing = argsHas(throttleArgs, 'noTrail', true)
      callback = throttle(callback, wait, leading, trailing)
    }

    const evtListOpts: AddEventListenerOptions = {
      capture: true,
      passive: false,
      once: false,
    }
    if (!ctx.modifiers.has('capture')) evtListOpts.capture = false
    if (ctx.modifiers.has('passive')) evtListOpts.passive = true
    if (ctx.modifiers.has('once')) evtListOpts.once = true

    if (key === 'load') {
      callback()
      return () => {}
    }
    const eventType = key.toLowerCase()
    el.addEventListener(eventType, callback, evtListOpts)
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

export const AttributePlugins: AttributePlugin[] = [
  BindAttributePlugin,
  TwoWayBindingModelPlugin,
  TextPlugin,
  FocusPlugin,
  // PromptPlugin,
  EventPlugin,
]

function argsToMs(args: string[] | undefined) {
  if (!args || args?.length === 0) return 0

  for (const arg of args) {
    if (arg.endsWith('ms')) {
      return Number(arg.replace('ms', ''))
    } else if (arg.endsWith('s')) {
      return Number(arg.replace('s', '')) * 1000
    }

    try {
      return parseFloat(arg)
    } catch (e) {}
  }

  return 0
}

function argsHas(args: string[] | undefined, arg: string, defaultValue = false) {
  if (!args) return false
  return args.includes(arg) || defaultValue
}

type TimerHandler = (...args: any[]) => void

function debounce(callback: TimerHandler, wait: number, leading = false, trailing = true): TimerHandler {
  let timer: NodeJS.Timeout | undefined

  const resetTimer = () => timer && clearTimeout(timer)

  return function wrapper(...args: any[]) {
    resetTimer()

    if (leading && !timer) {
      callback(...args)
    }

    timer = setTimeout(() => {
      if (trailing) {
        callback(...args)
      }
      resetTimer()
    }, wait)
  }
}

function throttle(callback: TimerHandler, wait: number, leading = true, trailing = false): TimerHandler {
  let waiting = false
  let lastArgs: any[] | null = null

  return function wrapper(...args: any[]) {
    if (!waiting) {
      waiting = true

      if (leading) {
        callback(...args)
      } else {
        lastArgs = args
      }

      setTimeout(() => {
        if (trailing && lastArgs) {
          callback(...lastArgs)
          lastArgs = null
        }
        waiting = false
      }, wait)
    } else {
      lastArgs = args
    }
  }
}
