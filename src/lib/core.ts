import { Reactive, autoStabilize, onCleanup, reactive } from '@reactively/core'
import { walkDownDOM, walkUpDOM } from './dom'
import { NamespacedReactiveRecords } from './types'

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

type PreprocessExpression = (raw: string) => string
const extensionPreprocessStack = new Array<PreprocessExpression>()
const data = new Map<Element, NamespacedReactiveRecords>()

export function addDataExtension(
  prefix: string,
  args?: {
    allowedModifiers?: Iterable<string>
    preprocessExpression?: (raw: string) => string
    withExpression?: (args: {
      name: string
      expression: string
      modifiers?: Set<string>
      el: Element
      dataStack: NamespacedReactiveRecords
      reactivity: {
        signal<T>(initialValue: T): Reactive<T>
        computed<T>(fn: () => T): Reactive<T>
        effect(fn: () => void): Reactive<void>
        onCleanup(fn: () => void): void
      }
    }) => NamespacedReactiveRecords
    requiredExtensions?: Set<string>
  },
) {
  if (args?.preprocessExpression) {
    extensionPreprocessStack.push(args.preprocessExpression)
  }

  const allAllowedModifiers = new Set()
  if (args?.allowedModifiers) {
    for (const modifier of args.allowedModifiers) {
      allAllowedModifiers.add(modifier)
    }
  }

  walkDownDOM(document.body, (el) => {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
      return
    }

    for (var d in el.dataset) {
      if (!d.startsWith(prefix)) continue

      let [name, ...modifiersArr] = d.split('.')

      const pl = prefix.length
      const pl1 = pl + 1
      name = name.slice(pl, pl1).toLocaleLowerCase() + name.slice(pl1)

      const modifiers = new Set(modifiersArr)
      modifiers.forEach((m) => {
        if (!allAllowedModifiers.has(m)) {
          throw new Error(`Modifier ${m} is not allowed for ${name}`)
        }
      })

      const dataStack = loadDataStack(el)
      let expression = el.dataset[d] || ''

      for (const preprocess of extensionPreprocessStack) {
        expression = preprocess(expression)
      }

      const elementData = data.get(el) || {}
      if (args?.withExpression) {
        const postExpression = args.withExpression({
          name,
          expression,
          modifiers,
          el,
          dataStack,
          reactivity: {
            signal,
            computed,
            effect,
            onCleanup,
          },
        })
        Object.assign(elementData, postExpression)
      }
      data.set(el, elementData)

      console.log({ name, modifiers, elementData })
    }
  })
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
