import { DeepState } from './external/deepsignal'
import { ReadonlySignal, Signal } from './external/preact-core'

export type HTMLorSVGElement = Element & (HTMLElement | SVGElement)

export type DatastarPlugin = {}

export type ExpressionFunction = (ctx: AttributeContext) => any
export type Reactivity = {
  signal: <T>(value: T) => Signal<T>
  computed: <T>(fn: () => T) => ReadonlySignal<T>
  effect: (cb: () => void) => OnRemovalFn
}

export type AttributeContext = {
  store: any
  mergeStore: (store: DeepState) => void
  applyPlugins: (target: Element) => void
  actions: Readonly<Actions>
  refs: Record<string, HTMLorSVGElement>
  reactivity: Reactivity
  el: Readonly<HTMLorSVGElement>
  key: Readonly<string>
  expression: Readonly<string>
  expressionFn: ExpressionFunction
  modifiers: Map<string, string[]>
}

export type InitContext = {
  store: any
  mergeStore: (store: DeepState) => void
  actions: Readonly<Actions>
  refs: Record<string, HTMLorSVGElement>
  reactivity: Reactivity
}

export type OnRemovalFn = () => void
export type AttributePlugin = {
  prefix: string // The prefix of the `data-${prefix}` attribute
  description: string // Used for debugging
  requiredPluginPrefixes?: Iterable<string> // If not provided, no plugins are required
  onGlobalInit?: (ctx: InitContext) => void // Called once on registration of the plugin
  onLoad: (ctx: AttributeContext) => OnRemovalFn | void // Return a function to be called on removal
  allowedModifiers?: Set<string> // If not provided, all modifiers are allowed
  mustHaveEmptyExpression?: boolean // The contents of the data-* attribute must be empty
  mustNotEmptyExpression?: boolean // The contents of the data-* attribute must not be empty
  mustHaveEmptyKey?: boolean // The key of the data-* attribute must be empty after the prefix
  mustNotEmptyKey?: boolean // The key of the data-* attribute must not be empty after the prefix
  allowedTags?: Set<string> // If not provided, all tags are allowed
  disallowedTags?: Set<string> // If not provided, no tags are disallowed
  preprocessers?: Set<Preprocesser> // If not provided, no preprocessers are used
  bypassExpressionFunctionCreation?: boolean // If true, the expression function is not created
}

export type RegexpGroups = Record<string, string>
export type Preprocesser = {
  name: string
  description: string
  regexp: RegExp
  replacer: (groups: RegexpGroups) => string
}

export type Action = (ctx: AttributeContext, args: string) => Promise<void>
export type Actions = Record<string, Action>
