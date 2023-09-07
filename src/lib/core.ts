import { camelize } from '.'
import { walkDownDOM, walkUpDOM } from './dom'
import { ACTION } from './extensions/actions'
import { Reactive, autoStabilize, onCleanup, reactive } from './external/reactively'
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

const extensionObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    m.removedNodes.forEach((node) => {
      const el = node as Element
      if (!el) return
      extensionElementRegistry.delete(el)
    })

    m.addedNodes.forEach((node) => {
      const el = node as Element
      if (!el) return
      extensionApplyFunctions.forEach((fn) => fn(el))
    })
  }
})

extensionObserver.observe(document, {
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

function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

const prefixHashes = new Map<string, number>()
const extensionApplyFunctions = new Map<number, Function>()
const extensionElementRegistry = new Map<Element, Set<number>>()
const extensionPreprocessStack = new Array<Preprocesser>()
const data = new Map<Element, NamespacedReactiveRecords>()

const actions: ActionsMap = {}

export function addDataExtension(
  prefix: string,
  args: {
    allowedTags?: Iterable<string>
    allowedModifiers?: Iterable<string | RegExp>
    isPreprocessGlobal?: boolean
    preprocessExpressions?: Iterable<Preprocesser>
    withExpression?: (args: WithExpressionArgs) => NamespacedReactiveRecords | void
    requiredExtensions?: Iterable<string>
  },
) {
  if (prefix.toLowerCase() !== prefix) throw Error(`Data extension 'data-${prefix}' must be lowercase`)
  if (prefixHashes.has(prefix)) {
    throw new Error(`Data extension 'data-${prefix}' already registered`)
  }

  const hash = cyrb53(prefix)
  prefixHashes.set(prefix, hash)

  if (!args) {
    args = {}
  }

  for (const extension of args.requiredExtensions || []) {
    if (extension === prefix) {
      throw new Error(`Data extension 'data-${prefix}' cannot require itself`)
    }
  }

  const extensionsRegistered = new Set(prefixHashes.keys())
  for (const requiredExtension of args.requiredExtensions || []) {
    if (!extensionsRegistered.has(requiredExtension)) {
      throw new Error(`Data extension 'data-${prefix}' can't be a duplicate`)
    }
  }

  if (typeof args?.isPreprocessGlobal === 'undefined') {
    args.isPreprocessGlobal = true
  }

  if (args?.preprocessExpressions && args.isPreprocessGlobal) {
    extensionPreprocessStack.push(...args.preprocessExpressions)
  }

  const allAllowedModifiers: RegExp[] = []
  if (args?.allowedModifiers) {
    for (const modifier of args.allowedModifiers) {
      const m = modifier instanceof RegExp ? modifier : new RegExp(modifier)
      allAllowedModifiers.push(m)
    }
  }

  const allowedTags = new Set([...(args?.allowedTags || [])].map((t) => t.toLowerCase()))

  function registerExtensionOnElement(parentEl: Element) {
    walkDownDOM(parentEl, (element) => {
      const el = toHTMLorSVGElement(element)
      if (!el) return

      let extensions = extensionElementRegistry.get(el)
      if (!extensions) {
        extensions = new Set()
        extensionElementRegistry.set(el, extensions)
      }

      if (extensions.has(hash)) return
      extensions.add(hash)

      if (allowedTags.size) {
        const tagLower = el.tagName.toLowerCase()
        if (!allowedTags.has(tagLower)) return
      }

      for (var d in el.dataset) {
        if (!d.startsWith(prefix)) continue

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
  }

  registerExtensionOnElement(document.body)
  extensionApplyFunctions.set(hash, registerExtensionOnElement)

  // console.info(`Registered data extension: data-${prefix}`)
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

export function addActionExtension(args: {
  name: string
  description: string
  fn: ActionFn
  requiredExtensions?: Iterable<string>
}) {
  const { name, fn, requiredExtensions } = args
  const extensionHashes = [ACTION, ...(requiredExtensions || [])]

  if (name != camelize(name)) {
    throw new Error(`must be camelCase`)
  }

  for (const ext of extensionHashes) {
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
