import { Dispose, MaybeDisposable, type Effect, type StopEffect } from '@maverick-js/signals'

export type HTMLorSVGElement = Element & (HTMLElement | SVGElement)

export type Context = {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
}

export abstract class DatastarPlugin {
  abstract name: string
  abstract description: string
  requiredPluginTypes = new Set<typeof DatastarPlugin>()
}

export type DatastarPluginConstructor = new () => DatastarPlugin

export type AttributeContext = Context & {
  el: Readonly<HTMLorSVGElement>
  key: Readonly<string>
  expressionRaw: Readonly<string>
  expressionEvaluated?: any
  modifiers: Readonly<Map<string, Readonly<string>[]>>
  effect: (
    effect: Effect,
    options?: {
      id?: string
    },
  ) => StopEffect
  cleanup: (disposable: MaybeDisposable) => Dispose
}

export abstract class AttributePlugin extends DatastarPlugin {
  abstract prefix: string
  abstract onMount(ctx: AttributeContext): void
  onUnmount?(ctx: AttributeContext): void
  mustHaveEmptyExpression = false
  mustHaveEmptyKey = false
  allowedTags?: Set<string>
  allowedModifiers?: Set<string>
  allowedModifierArgs?: Record<string, (args: string[]) => boolean>
}

export type Groups = Record<string, string>

export abstract class RunePlugin extends DatastarPlugin {
  abstract regexp: RegExp
  abstract replacer(groups: Groups): string
}

export abstract class ActionPlugin extends DatastarPlugin {
  abstract action(ctx: AttributeContext, ...args: any[]): Promise<void>
}
