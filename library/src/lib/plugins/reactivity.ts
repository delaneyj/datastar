import { computed, effect, signal, type ReadSignal, type WriteSignal } from '@maverick-js/signals'
import { AttributeContext, AttributePlugin, Groups, RunePlugin } from '../types'

export class ReactivityRunePlugin extends RunePlugin {
  name = 'ReactivityRune'
  description = 'A reactivity rune'
  regexp = new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g)
  replacer(groups: Groups) {
    const { signal } = groups
    return `get(${signal}).value`
  }
}

export class Signal<T> {
  private val: WriteSignal<T>
  constructor(value: T) {
    this.val = signal(value)
  }

  get value() {
    return this.val()
  }

  set value(v: T) {
    this.val.set(v)
  }
}

export class SignalAttributePlugin extends AttributePlugin {
  name = 'Signal'
  description = 'A signal attribute'
  prefix = 'signal'

  onMount({ key, set, expressionEvaluated }: AttributeContext) {
    set(key, new Signal(expressionEvaluated))
  }
}

export class Computed<T> {
  private val: ReadSignal<T>
  constructor(value: () => T) {
    this.val = computed(value)
  }

  get value() {
    return this.val()
  }
}

export class ComputedAttributePlugin extends AttributePlugin {
  name = 'Computed'
  description = 'A computed attribute'
  prefix = 'computed'

  onMount({ key, set, expressionEvaluated }: AttributeContext) {
    set(key, new Computed(expressionEvaluated))
  }
}

export class EffectAttributePlugin extends AttributePlugin {
  name = 'Effect'
  description = 'An effect attribute'
  prefix = 'effect'

  onMount({ key, set, expressionEvaluated }: AttributeContext) {
    if (typeof expressionEvaluated !== 'function') {
      throw new Error('Effect attribute must be a function')
    }

    set(key, effect(expressionEvaluated))
  }
}

export const reactivityPlugins = new Set([
  ReactivityRunePlugin,
  SignalAttributePlugin,
  ComputedAttributePlugin,
  EffectAttributePlugin,
])
