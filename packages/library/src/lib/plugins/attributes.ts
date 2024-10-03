import { sendDatastarEvent } from '..'
import { Actions, AttributeContext, AttributePlugin, RegexpGroups } from '../types'

const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase())

// Sets the value of the element
export const BindAttributePlugin: AttributePlugin = {
  prefix: 'bind',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,

  onLoad: (ctx: AttributeContext) => {
    return ctx.reactivity.effect(async () => {
      const key = kebabize(ctx.key)
      const value = ctx.expressionFn(ctx)
      let v: string
      if (typeof value === 'string') {
        v = value
      } else {
        v = JSON.stringify(value)
      }
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
    const { el, expression } = ctx
    const signal = ctx.expressionFn(ctx)
    const tnl = el.tagName.toLowerCase()

    if (expression.startsWith('ctx.store().ctx.store()')) {
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

    const signalName = expression.replaceAll('ctx.store().', '')
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
        // File input reading from a signal is not supported yet
      } else if (hasValue) {
        el.value = `${v}`
      } else {
        el.setAttribute('value', `${v}`)
      }
    }
    const cleanupSetInputFromSignal = ctx.reactivity.effect(setInputFromSignal)

    const setSignalFromInput = async () => {
      if (isFile) {
        const files = [...((el as HTMLInputElement)?.files || [])],
          allContents: string[] = [],
          allMimes: string[] = [],
          allNames: string[] = []

        await Promise.all(
          files.map((f) => {
            return new Promise<void>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => {
                if (typeof reader.result !== 'string') throw new Error(`Invalid result type: ${typeof reader.result}`)
                const match = reader.result.match(dataURIRegex)
                if (!match?.groups) throw new Error(`Invalid data URI: ${reader.result}`)
                allContents.push(match.groups.contents)
                allMimes.push(match.groups.mime)
                allNames.push(f.name)
              }
              reader.onloadend = () => resolve(void 0)
              reader.readAsDataURL(f)
            })
          }),
        )

        signal.value = allContents
        const s = ctx.store()
        const mimeName = `${signalName}Mimes`,
          nameName = `${signalName}Names`
        if (mimeName in s) {
          s[`${mimeName}`].value = allMimes
        }
        if (nameName in s) {
          s[`${nameName}`].value = allNames
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

let lastStoreMarshalled = ''

const knownOnModifiers = new Set(['window', 'once', 'passive', 'capture', 'debounce', 'throttle', 'remote', 'outside'])

// Sets the event listener of the element
export const EventPlugin: AttributePlugin = {
  prefix: 'on',
  mustNotEmptyKey: true,
  mustNotEmptyExpression: true,
  argumentNames: ['evt'],
  onLoad: (ctx: AttributeContext) => {
    const { el, key, expressionFn } = ctx

    let target: Element | Window | Document = ctx.el
    if (ctx.modifiers.get('window')) {
      target = window
    }

    let callback = (evt?: Event) => {
      sendDatastarEvent('plugin', 'event', key, target, 'triggered')
      expressionFn(ctx, evt)
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
      const trailing = argsHas(throttleArgs, 'noTrail', false)
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

    const unknownModifierKeys = [...ctx.modifiers.keys()].filter((key) => !knownOnModifiers.has(key))

    unknownModifierKeys.forEach((attrName) => {
      const eventValues = ctx.modifiers.get(attrName) || []
      const cb = callback
      const revisedCallback = () => {
        const evt = event as any
        const attr = evt[attrName]
        let valid: boolean

        if (typeof attr === 'function') {
          valid = attr(...eventValues)
        } else if (typeof attr === 'boolean') {
          valid = attr
        } else if (typeof attr === 'string') {
          const expr = eventValues.join('')
          valid = attr === expr
        } else {
          const msg = `Invalid value for ${attrName} modifier on ${key} on ${el}`
          console.error(msg)
          debugger
          throw new Error(msg)
        }

        if (valid) {
          cb(evt)
        }
      }
      callback = revisedCallback
    })

    const eventName = kebabize(key).toLowerCase()
    switch (eventName) {
      case 'load':
        callback()
        delete ctx.el.dataset.onLoad
        return () => {}

      case 'raf':
        let rafId: number | undefined
        const raf = () => {
          callback()
          rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        return () => {
          if (rafId) cancelAnimationFrame(rafId)
        }

      case 'store-change':
        return ctx.reactivity.effect(() => {
          const store = ctx.store()
          let storeValue = store.value
          if (ctx.modifiers.has('remote')) {
            storeValue = remoteSignals(storeValue)
          }
          const current = JSON.stringify(storeValue)
          if (lastStoreMarshalled !== current) {
            lastStoreMarshalled = current
            callback()
          }
        })

      default:
        const testOutside = ctx.modifiers.has('outside')
        if (testOutside) {
          target = document
          const cb = callback
          let called = false
          const targetOutsideCallback = (e?: Event) => {
            const targetHTML = e?.target as HTMLElement
            if (!targetHTML) return
            const isEl = el.id === targetHTML.id
            if (!isEl && !called) {
              cb(e)
              called = true
            }
          }
          callback = targetOutsideCallback
        }

        target.addEventListener(eventName, callback, evtListOpts)
        return () => {
          // console.log(`Removing event listener for ${eventName} on ${el}`)
          target.removeEventListener(eventName, callback)
        }
    }
  },
}

export function remoteSignals(obj: Object): Object {
  const res: Record<string, any> = {}

  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) {
      continue
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      res[k] = remoteSignals(v) // recurse
    } else {
      res[k] = v
    }
  }

  return res
}

export const AttributePlugins: AttributePlugin[] = [
  BindAttributePlugin,
  TwoWayBindingModelPlugin,
  TextPlugin,
  EventPlugin,
]

export const AttributeActions: Actions = {
  remote: async (ctx: AttributeContext) => {
    return remoteSignals(ctx.store().value)
  },
}

export function argsToMs(args: string[] | undefined) {
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

export function argsHas(args: string[] | undefined, arg: string, defaultValue = false) {
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
