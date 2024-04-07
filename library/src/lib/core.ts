import { toHTMLorSVGElement } from './dom'
import { DeepSignal, DeepState, deepSignal } from './external/deepsignal'
import { Signal, computed, effect, signal } from './external/preact-core'
import { apply } from './external/ts-merge-patch'
import { CorePlugins, CorePreprocessors } from './plugins/core'
import {
  Actions,
  AttributeContext,
  AttributePlugin,
  ExpressionFunction,
  HTMLorSVGElement,
  OnRemovalFn,
  Preprocesser,
  Reactivity,
} from './types'

export const DATASTAR_ERROR = new Error('Datastar error')

export class Datastar {
  plugins: AttributePlugin[] = []
  store: DeepSignal<any> = deepSignal({})
  actions: Actions = {}
  refs: Record<string, HTMLElement> = {}
  reactivity: Reactivity = {
    signal,
    computed,
    effect,
  }
  parentID = ''
  missingIDNext = 0
  removals = new Map<Element, Set<OnRemovalFn>>()

  constructor(actions: Actions = {}, ...plugins: AttributePlugin[]) {
    this.actions = Object.assign(this.actions, actions)
    plugins = [...CorePlugins, ...plugins]
    if (!plugins.length) throw DATASTAR_ERROR

    const allPluginPrefixes = new Set<string>()
    for (const p of plugins) {
      if (p.requiredPluginPrefixes) {
        for (const requiredPluginType of p.requiredPluginPrefixes) {
          if (!allPluginPrefixes.has(requiredPluginType)) {
            //throw new Error(`${p.prefix} requires ${requiredPluginType}`)
            throw DATASTAR_ERROR
          }
        }
      }

      this.plugins.push(p)
      allPluginPrefixes.add(p.prefix)
    }
  }

  run() {
    this.plugins.forEach((p) => {
      if (p.onGlobalInit) {
        p.onGlobalInit({
          actions: this.actions,
          refs: this.refs,
          reactivity: this.reactivity,
          mergeStore: this.mergeStore.bind(this),
          store: this.store,
        })
      }
    })
    this.applyPlugins(document.body)
  }

  private cleanupElementRemovals(element: Element) {
    const removalSet = this.removals.get(element)
    if (removalSet) {
      for (const removal of removalSet) {
        removal()
      }
      this.removals.delete(element)
    }
  }

  private mergeStore<T extends object>(patchStore: T) {
    const revisedStore = apply(this.store.value, patchStore) as DeepState
    this.store = deepSignal(revisedStore)
  }

  public signalByName<T>(name: string) {
    return (this.store as any)[name] as Signal<T>
  }

  private applyPlugins(rootElement: Element) {
    const appliedProcessors = new Set<Preprocesser>()

    this.plugins.forEach((p, pi) => {
      this.walkDownDOM(rootElement, (el) => {
        if (pi === 0) this.cleanupElementRemovals(el)

        for (const dsKey in el.dataset) {
          let expression = el.dataset[dsKey] || ''

          if (!dsKey.startsWith(p.prefix)) continue

          if (el.id.length === 0) {
            el.id = `ds-${this.parentID}-${this.missingIDNext++}`
          }

          appliedProcessors.clear()

          if (p.allowedTagRegexps) {
            const lowerCaseTag = el.tagName.toLowerCase()
            const allowed = [...p.allowedTagRegexps].some((r) => lowerCaseTag.match(r))
            if (!allowed) {
              throw new Error(
                `'${el.tagName}' not allowed for '${dsKey}', allowed ${[
                  [...p.allowedTagRegexps].map((t) => `'${t}'`),
                ].join(', ')}`,
              )
            }
            // console.log(`Tag '${el.tagName}' is allowed for plugin '${dsKey}'`)
          }

          let keyRaw = dsKey.slice(p.prefix.length)
          let [key, ...modifiersWithArgsArr] = keyRaw.split('.')
          if (p.mustHaveEmptyKey && key.length > 0) {
            // throw new Error(`'${dsKey}' must have empty key`)
            throw DATASTAR_ERROR
          }
          if (p.mustNotEmptyKey && key.length === 0) {
            // throw new Error(`'${dsKey}' must have non-empty key`)
            throw DATASTAR_ERROR
          }
          if (key.length) {
            key = key[0].toLowerCase() + key.slice(1)
          }

          const modifiersArr = modifiersWithArgsArr.map((m) => {
            const [label, ...args] = m.split('_')
            return { label, args }
          })
          if (p.allowedModifiers) {
            for (const modifier of modifiersArr) {
              if (!p.allowedModifiers.has(modifier.label)) {
                // throw new Error(`'${modifier.label}' is not allowed`)
                throw DATASTAR_ERROR
              }
            }
          }
          const modifiers = new Map<string, string[]>()
          for (const modifier of modifiersArr) {
            modifiers.set(modifier.label, modifier.args)
          }

          if (p.mustHaveEmptyExpression && expression.length) {
            // throw new Error(`'${dsKey}' must have empty expression`)
            throw DATASTAR_ERROR
          }
          if (p.mustNotEmptyExpression && !expression.length) {
            // throw new Error(`'${dsKey}' must have non-empty expression`)
            throw DATASTAR_ERROR
          }

          const processors = [...(p.preprocessors?.pre || []), ...CorePreprocessors, ...(p.preprocessors?.post || [])]
          for (const processor of processors) {
            if (appliedProcessors.has(processor)) continue
            appliedProcessors.add(processor)

            const expressionParts = expression.split(';')
            const revisedParts: string[] = []

            expressionParts.forEach((exp) => {
              let revised = exp
              const matches = [...revised.matchAll(processor.regexp)]
              if (matches.length) {
                for (const match of matches) {
                  if (!match.groups) continue
                  const { groups } = match
                  const { whole } = groups
                  revised = revised.replace(whole, processor.replacer(groups))
                }
              }
              revisedParts.push(revised)
            })
            // })

            expression = revisedParts.join('; ')
          }

          const ctx: AttributeContext = {
            store: () => this.store,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions: this.actions,
            refs: this.refs,
            reactivity: this.reactivity,
            el,
            key,
            expression,
            expressionFn: () => {
              // throw new Error('Expression function not created')
              throw DATASTAR_ERROR
            },
            modifiers,
          }

          if (!p.bypassExpressionFunctionCreation?.(ctx) && !p.mustHaveEmptyExpression && expression.length) {
            const statements = expression.split(';').map((s) => s.trim())
            statements[statements.length - 1] = `return ${statements[statements.length - 1]}`
            const fnContent = `
try {
${statements.map((s) => `  ${s}`).join(';\n')}
} catch (e) {
  throw e
}
            `
            try {
              const fn = new Function('ctx', fnContent) as ExpressionFunction
              ctx.expressionFn = fn
            } catch (e) {
              // throw new Error(`Error creating expression function for '${fnContent}'`)
              throw DATASTAR_ERROR
            }
          }

          const removal = p.onLoad(ctx)
          if (removal) {
            if (!this.removals.has(el)) {
              this.removals.set(el, new Set())
            }
            this.removals.get(el)!.add(removal)
          }
        }
      })
    })
  }

  private walkSignalsStore(store: any, callback: (name: string, signal: Signal<any>) => void) {
    const keys = Object.keys(store)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = store[key]
      const isSignal = value instanceof Signal
      const hasChildren = typeof value === 'object' && Object.keys(value).length > 0

      if (isSignal) {
        callback(key, value)
        continue
      }

      if (!hasChildren) continue

      this.walkSignalsStore(value, callback)
    }
  }

  private walkSignals(callback: (name: string, signal: Signal<any>) => void) {
    this.walkSignalsStore(this.store, callback)
  }

  private walkDownDOM(element: Element | null, callback: (el: HTMLorSVGElement) => void, siblingOffset = 0) {
    if (!element) return
    const el = toHTMLorSVGElement(element)
    if (!el) return

    callback(el)

    siblingOffset = 0
    element = element.firstElementChild
    while (element) {
      this.walkDownDOM(element, callback, siblingOffset++)
      element = element.nextElementSibling
    }
  }
}
