import { Signal } from '../external/preact-core'
import { AttributeContext, AttributePlugin, RegexpGroups } from '../types'

const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())

// Sets the value of the element
export const BindAttributePlugin: AttributePlugin = {
  prefix: 'bind',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx: AttributeContext) => {
    return ctx.reactivity.effect(async () => {
      const key = kebabize(ctx.key)
      const value = await ctx.expressionFn(ctx)
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

// Sets the value of the element
export const TwoWayBindingModelPlugin: AttributePlugin = {
  prefix: 'model',
  mustHaveEmptyKey: true,
  preprocessors: {
    post: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (groups: RegexpGroups) => {
          const { whole } = groups
          return `ctx.store().${whole}`
        },
      },
    ],
  },
  allowedTagRegexps: new Set(['input', 'textarea', 'select', 'checkbox', 'radio']),
  // bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    const { el, expression: signalName } = ctx
    const signal = ctx.expressionFn(ctx)
    const tnl = el.tagName.toLowerCase()

    if (signalName.startsWith('ctx.store().ctx.store()')) {
      throw new Error(`Model attribute on #${el.id} must have a signal name, you probably prefixed with $ by accident`)
    }

    const isInput = tnl.includes('input')
    const isSelect = tnl.includes('select')
    const isTextarea = tnl.includes('textarea')
    const type = el.getAttribute('type')
    const isCheckbox = tnl.includes('checkbox') || (isInput && type === 'checkbox')
    const isRadio = tnl.includes('radio') || (isInput && type === 'radio')
    const isFile = isInput && type === 'file'

    if (!isInput && !isSelect && !isTextarea && !isCheckbox && !isRadio) {
      throw new Error('Element must be input, select, textarea, checkbox or radio')
    }

    if (isRadio) {
      const name = el.getAttribute('name')
      if (!name?.length) {
        el.setAttribute('name', signalName)
      }
    }

    const setInputFromSignal = () => {
      if (!signal) {
        throw new Error(`Signal ${signalName} not found`)
      }
      const hasValue = 'value' in el
      const v = signal.value
      if (isCheckbox || isRadio) {
        const input = el as HTMLInputElement
        if (isCheckbox) {
          input.checked = v
        } else if (isRadio) {
          // evaluate the value as string to handle any type casting
          // automatically since the attribute has to be a string anyways
          input.checked = `${v}` === input.value
        }
      } else if (isFile) {
        throw new Error('File input reading is not supported yet')
      } else if (hasValue) {
        el.value = `${v}`
      } else {
        el.setAttribute('value', `${v}`)
      }
    }
    const cleanupSetInputFromSignal = ctx.reactivity.effect(setInputFromSignal)

    const setSignalFromInput = () => {
      if (isFile) {
        const [f] = (el as any)?.files || []
        if (!f) {
          signal.value = ''
          return
        }
        const reader = new FileReader()
        const s = ctx.store()
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            throw new Error('Unsupported type')
          }

          const match = reader.result.match(dataURIRegex)
          if (!match?.groups) {
            throw new Error('Invalid data URI')
          }
          const { mime, contents } = match.groups
          signal.value = contents

          const mimeName = `${signalName}Mime`
          if (mimeName in s) {
            const mimeSignal = s[`${mimeName}`] as Signal<string>
            mimeSignal.value = mime
          }
        }
        reader.readAsDataURL(f)

        const nameName = `${signalName}Name`
        if (nameName in s) {
          const nameSignal = s[`${nameName}`] as Signal<string>
          nameSignal.value = f.name
        }

        return
      }

      const current = signal.value
      const input = el as HTMLInputElement
      if (typeof current === 'number') {
        signal.value = Number(input.value)
      } else if (typeof current === 'string') {
        signal.value = input.value
      } else if (typeof current === 'boolean') {
        if (isCheckbox) {
          signal.value = input.checked
        } else {
          signal.value = Boolean(input.value)
        }
      } else if (typeof current === 'undefined') {
      } else if (typeof current === 'bigint') {
        signal.value = BigInt(input.value)
      } else {
        console.log(typeof current)
        throw new Error('Unsupported type')
      }
    }

    const parts = el.tagName.split('-')
    const isCustomElement = parts.length > 1
    if (isCustomElement) {
      const customElementPrefix = parts[0].toLowerCase()
      updateModelEvents.forEach((eventType) => {
        updateModelEvents.push(`${customElementPrefix}-${eventType}`)
      })
    }

    updateModelEvents.forEach((eventType) => el.addEventListener(eventType, setSignalFromInput))

    return () => {
      cleanupSetInputFromSignal()
      updateModelEvents.forEach((event) => el.removeEventListener(event, setSignalFromInput))
    }
  },
}

// Sets the textContent of the element
export const TextPlugin: AttributePlugin = {
  prefix: 'text',
  mustHaveEmptyKey: true,

  onLoad: (ctx: AttributeContext) => {
    const { el, expressionFn } = ctx
    if (!(el instanceof HTMLElement)) {
      throw new Error('Element is not HTMLElement')
    }
    return ctx.reactivity.effect(() => {
      const res = expressionFn(ctx)
      el.textContent = `${res}`
    })
  },
}

// Sets the event listener of the element
export const EventPlugin: AttributePlugin = {
  prefix: 'on',
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

    const eventName = kebabize(key).toLowerCase()
    if (eventName === 'load') {
      callback()
      delete el.dataset.onLoad
      return () => {}
    }
    el.addEventListener(eventName, callback, evtListOpts)
    return () => {
      // console.log(`Removing event listener for ${eventName} on ${el}`)
      el.removeEventListener(eventName, callback)
    }
  },
}

export const AttributePlugins: AttributePlugin[] = [
  BindAttributePlugin,
  TwoWayBindingModelPlugin,
  TextPlugin,
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
