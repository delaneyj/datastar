import { camelize } from '.'
import { walkDownDOM, walkUpDOM } from './dom'
import { Reactive, autoStabilize, onCleanup, reactive } from './external/reactively'
import { ACTION } from './plugins/actions'
import { ActionFn, ActionsMap, Modifier, NamespacedReactiveRecords, WithExpressionArgs } from './types'
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

const pluginObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    m.removedNodes.forEach((node) => {
      const el = node as Element
      if (!el) return
      pluginElementRegistry.delete(el)
    })

    // m.addedNodes.forEach((node) => {
    //   const el = node as Element
    //   if (!el) return
    //   pluginApplyFunctions.forEach((fn) => fn(el))
    // })
  }
})

pluginObserver.observe(document, {
  attributes: true,
  childList: true,
  subtree: true,
})

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

const prefixHashes = new Map<string, string>()
const pluginApplyFunctions = new Map<string, Function>()
const pluginElementRegistry = new Map<Element, Set<string>>()
const pluginPreprocessStack = new Array<Preprocesser>()
const data = new Map<Element, NamespacedReactiveRecords>()

export function applyPlugins(el: Element) {
  walkDownDOM(el, (element) => {
    pluginElementRegistry.delete(element)
  })
  pluginApplyFunctions.forEach((fn, name) => {
    console.log(`apply ${name} to ${el.id || el.tagName} `)
    fn(el)
  })
}

const actions: ActionsMap = {}

export function addDataPlugin(
  prefix: string,
  args: {
    allowedTags?: Iterable<string>
    allowedModifiers?: Iterable<string | RegExp>
    isPreprocessGlobal?: boolean
    preprocessExpressions?: Iterable<Preprocesser>
    withExpression?: (args: WithExpressionArgs) => NamespacedReactiveRecords | void
    requiredPlugins?: Iterable<string>
  },
) {
  if (prefix.toLowerCase() !== prefix) throw Error(`Data plugin 'data-${prefix}' must be lowercase`)
  if (prefixHashes.has(prefix)) {
    throw new Error(`Data plugin 'data-${prefix}' already registered`)
  }

  const hash = prefix
  // const hash = cyrb53(prefix)
  prefixHashes.set(prefix, hash)

  if (!args) {
    args = {}
  }

  for (const plugin of args.requiredPlugins || []) {
    if (plugin === prefix) {
      throw new Error(`Data plugin 'data-${prefix}' cannot require itself`)
    }
  }

  const pluginsRegistered = new Set(prefixHashes.keys())
  for (const requiredPlugin of args.requiredPlugins || []) {
    if (!pluginsRegistered.has(requiredPlugin)) {
      throw new Error(`Data plugin 'data-${prefix}' requires 'data-${requiredPlugin}'`)
    }
  }

  if (typeof args?.isPreprocessGlobal === 'undefined') {
    args.isPreprocessGlobal = true
  }

  if (args?.preprocessExpressions && args.isPreprocessGlobal) {
    pluginPreprocessStack.push(...args.preprocessExpressions)
  }

  const allAllowedModifiers: RegExp[] = []
  if (args?.allowedModifiers) {
    for (const modifier of args.allowedModifiers) {
      const m = modifier instanceof RegExp ? modifier : new RegExp(modifier)
      allAllowedModifiers.push(m)
    }
  }

  const allowedTags = new Set([...(args?.allowedTags || [])].map((t) => t.toLowerCase()))

  function registerPluginOnElement(parentEl: Element) {
    walkDownDOM(parentEl, (element) => {
      const el = toHTMLorSVGElement(element)
      if (!el) return

      let plugins = pluginElementRegistry.get(el)
      if (!plugins) {
        plugins = new Set()
        pluginElementRegistry.set(el, plugins)
      }

      if (plugins.has(hash)) return
      plugins.add(hash)

      if (allowedTags.size) {
        const tagLower = el.tagName.toLowerCase()
        if (!allowedTags.has(tagLower)) return
      }

      for (var d in el.dataset) {
        if (!d.startsWith(prefix)) continue

        // console.log(`add plugin ${d} to ${el.id || el.tagName}`)
        let [name, ...modifiersWithArgsArr] = d.split('.')

        const pl = prefix.length
        const pl1 = pl + 1
        name = name.slice(pl, pl1).toLocaleLowerCase() + name.slice(pl1)

        const modifiers = modifiersWithArgsArr.map((m) => {
          const [label, ...args] = m.split(':')

          const isAllowed = allAllowedModifiers.some((allowedModifier) => allowedModifier.test(label))
          if (!isAllowed) {
            throw new Error(`Modifier ${label} is not allowed for ${name}`)
          }

          return { label, args }
        })

        const dataStack = loadDataStack(el)
        let expression = el.dataset[d] || ''

        for (const preprocessor of pluginPreprocessStack) {
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
            applyPlugins: (el: Element) => pluginApplyFunctions.forEach((fn) => fn(el)),
            actions,
          })
          if (postExpression) {
            Object.assign(elementData, postExpression)
          }
        }
        data.set(el, elementData)
      }
    })
  }

  registerPluginOnElement(document.body)
  pluginApplyFunctions.set(hash, registerPluginOnElement)

  console.info(`Registered data plugin: data-${prefix}`)
}

function loadDataStack(el: Element): NamespacedReactiveRecords {
  const stack: NamespacedReactiveRecords[] = []

  walkUpDOM(el, (el) => {
    const elData = data.get(el)
    if (elData) stack.push(elData)
  })

  stack.reverse()

  const dataStack: NamespacedReactiveRecords = {}
  for (const namespacedRecords of stack) {
    for (const namespaceKey in namespacedRecords) {
      if (!dataStack[namespaceKey]) {
        dataStack[namespaceKey] = {}
      }
      Object.assign(dataStack[namespaceKey], namespacedRecords[namespaceKey])
    }
  }

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

export function addActionPlugin(args: {
  name: string
  description: string
  fn: ActionFn
  requiredPlugins?: Iterable<string>
}) {
  const { name, fn, requiredPlugins } = args
  const pluginHashes = [ACTION, ...(requiredPlugins || [])]

  if (name != camelize(name)) {
    throw new Error(`must be camelCase`)
  }

  for (const ext of pluginHashes) {
    if (!prefixHashes.has(ext)) {
      throw new Error(`requires '@${name}' registration`)
    }

    if (name in actions) {
      throw new Error(`'@${name}' already registered`)
    }

    actions[name] = fn
  }
}

let nextID = 0
export function uniqueId() {
  return nextID++
}
