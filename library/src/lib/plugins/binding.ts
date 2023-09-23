import { AttributeContext, AttributePlugin, Groups, HTMLorSVGElement, RunePlugin } from '../types'
import { Signal, SignalAttributePlugin } from './reactivity'
import { noArgs } from './shared'

export class BindAttributePlugin extends AttributePlugin {
  name = 'Bind'
  prefix = 'bind'
  description = 'Sets the value of the element'

  onMount({ el, key, expressionEvaluated }: AttributeContext) {
    el.setAttribute(key, `${expressionEvaluated}`)
  }
}

export class RefRunePlugin extends RunePlugin {
  name = 'RefRune'
  description = 'turns #ref into data.refs.ref.value'
  regexp = new RegExp(/(?<whole>\#(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)
  replacer({ ref }: Groups) {
    return `data.refs.${ref}.value`
  }
}

export class RefAttributePlugin extends AttributePlugin {
  name = 'Ref'
  prefix = 'ref'
  description = 'Sets the value of the element'
  mustHaveEmptyExpression = true

  onMount({ el, key, set }: AttributeContext) {
    set(key, el)
  }
}

export function getRef(ctx: AttributeContext, key: string) {
  return ctx.get(key) as HTMLorSVGElement
}

export class ModelAttributePlugin extends AttributePlugin {
  name = 'Model'
  prefix = 'model'
  description = 'Sets the value of the element'
  allowedTags = new Set(['input', 'textarea', 'select'])
  requiredPluginTypes = new Set([SignalAttributePlugin])
  updateEvents = ['change', 'input', 'keydown']
  mustHaveEmptyExpression = true
  mustHaveEmptyKey = true

  onMount({ el, expressionEvaluated, effect, cleanup }: AttributeContext) {
    if (!('value' in el)) throw new Error('Element must have a value property')
    const signal = expressionEvaluated as Signal<any>
    if (!signal) throw new Error(`Signal ${expressionEvaluated} not found`)
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

    effect(() => {
      for (const event of this.updateEvents) {
        el.addEventListener(event, setter)
      }

      cleanup(() => {
        for (const event of this.updateEvents) {
          el.removeEventListener(event, setter)
        }
      })
    })
  }
}

export class EventListenerAttributePlugin extends AttributePlugin {
  name = 'EventListener'
  prefix = 'on'
  description = 'Sets the value of the element'
  allowedModifiers = new Set(['prevent', 'stop', 'capture'])
  allowedModifierArgs = {
    prevent: noArgs,
    stop: noArgs,
    capture: noArgs,
  }

  onMount({ el, key, modifiers, expressionEvaluated, effect, cleanup }: AttributeContext) {
    const fn = expressionEvaluated as EventListener
    if (!fn) throw new Error(`Function ${expressionEvaluated} not found`)

    const options: AddEventListenerOptions = {}
    if (modifiers.has('capture')) options.capture = true
    if (modifiers.has('prevent')) options.passive = false
    if (modifiers.has('stop')) options.once = true

    effect(() => {
      el.addEventListener(key, fn, options)
      cleanup(() => el.removeEventListener(key, fn, options))
    })
  }
}

export class TextNodeAttributePlugin extends AttributePlugin {
  name = 'TextNode'
  prefix = 'text'
  description = 'Sets the textContent of the element'
  mustHaveEmptyKey = true
  mustHaveEmptyExpression = true

  onMount({ el, expressionEvaluated }: AttributeContext) {
    if (!(el instanceof HTMLElement)) throw new Error('Element is not HTMLElement')
    el.textContent = `${expressionEvaluated}`
  }
}

export class FocusElementAttributePlugin extends AttributePlugin {
  name = 'FocusElement'
  prefix = 'focus'
  description = 'Sets the textContent of the element'
  mustHaveEmptyKey = true
  mustHaveEmptyExpression = true

  onMount({ el }: AttributeContext) {
    el.focus()
  }
}
