import { Reactive, autoStabilize, onCleanup, reactive } from '@reactively/core'
import { walkDownDOM, walkUpDOM } from './dom'
import { Modifier, NamespacedReactiveRecords, Reactivity } from './types'

autoStabilize()

function signal<T>(initialValue: T): Reactive<T> {
  return reactive(initialValue)
}

function computed<T>(fn: () => T): Reactive<T> {
  return reactive(fn)
}

function effect(fn: () => void) {
  return reactive(fn, { effect: true })
}

const extensionsRegistered = new Set<Symbol>()

export interface Preprocesser {
  name: string
  description: string
  regexp: RegExp
  replacer: (groups: Record<string, string>) => string
}
export function useProcessor({ regexp, replacer }: Preprocesser, str: string): string {
  // console.log(`preprocess with ${name}. ${description}`)
  const matches = [...str.matchAll(regexp)]
  if (!matches.length) return str
  for (const match of matches) {
    if (!match.groups) continue
    const { groups } = match
    const { whole } = groups
    str = str.replace(whole, replacer(groups))
  }
  return str
}

const extensionPreprocessStack = new Array<Preprocesser>()
const data = new Map<Element, NamespacedReactiveRecords>()
const actions = new Map<string, Function>()

export type WithExpressionArgs = {
  name: string
  expression: string
  el: Element
  dataStack: NamespacedReactiveRecords
  reactivity: Reactivity
  withMod(label: string): Modifier | undefined
  hasMod(label: string): boolean
  actions: Map<string, Function>
}

export function addDataExtension(
  prefix: Symbol,
  args: {
    allowedModifiers?: Iterable<string>
    isPreprocessGlobal?: boolean
    preprocessExpressions?: Iterable<Preprocesser>
    withExpression?: (args: WithExpressionArgs) => NamespacedReactiveRecords | void
    requiredExtensions?: Iterable<Symbol>
    actionsAdded?: Record<string, Function>
  },
) {
  if (!prefix.description) throw Error()
  if (prefix.description.toLowerCase() !== prefix.description)
    throw Error(`Data extension 'data-${prefix.description}' must be lowercase`)

  if (!args) {
    args = {}
  }

  if (extensionsRegistered.has(prefix)) {
    throw new Error(`Data extension 'data-${prefix}' already registered`)
  }

  if (args?.requiredExtensions) {
    for (const requiredExtension of args.requiredExtensions) {
      if (!extensionsRegistered.has(requiredExtension)) {
        throw new Error(
          `Data extension 'data-${prefix.description}' requires 'data-${requiredExtension}' to be registered first`,
        )
      }
    }
  }

  if (typeof args?.isPreprocessGlobal === 'undefined') {
    args.isPreprocessGlobal = true
  }

  if (args?.preprocessExpressions && args.isPreprocessGlobal) {
    extensionPreprocessStack.push(...args.preprocessExpressions)
  }

  const allAllowedModifiers = new Set()
  if (args?.allowedModifiers) {
    for (const modifier of args.allowedModifiers) {
      allAllowedModifiers.add(modifier)
    }
  }

  if (args?.actionsAdded) {
    for (const [name, fn] of Object.entries(args.actionsAdded)) {
      if (actions.has(name)) throw new Error(`Action '${name}' already registered`)
      actions.set(name, fn)
    }
  }

  walkDownDOM(document.body, (element) => {
    if (!prefix.description) throw Error()

    const el = toHTMLorSVGElement(element)
    if (!el) return

    for (var d in el.dataset) {
      if (!d.startsWith(prefix?.description)) continue

      let [name, ...modifiersWithArgsArr] = d.split('.')

      const pl = prefix.description.length
      const pl1 = pl + 1
      name = name.slice(pl, pl1).toLocaleLowerCase() + name.slice(pl1)

      const modifiers = modifiersWithArgsArr.map((m) => {
        const [label, ...args] = m.split(':')
        if (!allAllowedModifiers.has(label)) {
          throw new Error(`Modifier ${label} is not allowed for ${name}`)
        }
        return { label, args }
      })

      const dataStack = loadDataStack(el)
      let expression = el.dataset[d] || ''

      for (const preprocessor of extensionPreprocessStack) {
        expression = useProcessor(preprocessor, expression)
      }

      if (args?.preprocessExpressions && !args?.isPreprocessGlobal) {
        for (const preprocessor of args.preprocessExpressions) {
          expression = useProcessor(preprocessor, expression)
        }
      }

      const elementData = data.get(el) || {}
      if (args?.withExpression) {
        const postExpression = args.withExpression({
          name,
          expression,
          el,
          dataStack,
          reactivity: {
            signal,
            computed,
            effect,
            onCleanup,
          },
          withMod: (label: string) => withModifier(modifiers, label),
          hasMod: (label: string) => hasModifier(modifiers, label),
          actions,
        })
        if (postExpression) {
          Object.assign(elementData, postExpression)
        }
      }
      data.set(el, elementData)
    }
  })

  extensionsRegistered.add(prefix)
  console.log(`Registered data extension: data-${prefix.description}`)
}

function loadDataStack(el: Element): NamespacedReactiveRecords {
  const stack: NamespacedReactiveRecords[] = []

  walkUpDOM(el, (el) => {
    const elData = data.get(el)
    if (elData) stack.push(elData)
  })

  stack.reverse()

  const dataStack = Object.assign({}, ...stack)
  return dataStack
}

export function toHTMLorSVGElement(el: Element) {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
    return null
  }
  return el
}

export function hasModifier(modifiers: Modifier[], label: string) {
  return modifiers.some((m) => m.label === label)
}

export function withModifier(modifiers: Modifier[], label: string) {
  return modifiers.find((m) => m.label === label)
}
