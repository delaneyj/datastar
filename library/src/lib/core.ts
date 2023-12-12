import { toHTMLorSVGElement } from './dom'
import { DeepSignal, DeepState, deepSignal } from './external/deepsignal'
import { JSONParse, JSONStringify } from './external/json-bigint'
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
    if (!plugins.length) throw new Error('no plugins')

    const allPluginPrefixes = new Set<string>()
    for (const p of plugins) {
      if (p.requiredPluginPrefixes) {
        for (const requiredPluginType of p.requiredPluginPrefixes) {
          if (!allPluginPrefixes.has(requiredPluginType)) {
            throw new Error(`${p.prefix} requires ${requiredPluginType}`)
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

  public JSONStringify<T>(data: T): string {
    return JSONStringify(data)
  }

  public JSONParse<T>(json: string): T {
    return JSONParse(json)
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

  private mergeStore<T extends object>(store: T) {
    const revisedStore = apply(this.store.value, store) as DeepState
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
            throw new Error(`'${dsKey}' must have empty key`)
          }
          if (p.mustNotEmptyKey && key.length === 0) {
            throw new Error(`'${dsKey}' must have non-empty key`)
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
                throw new Error(`'${modifier.label}' is not allowed`)
              }
            }
          }
          const modifiers = new Map<string, string[]>()
          for (const modifier of modifiersArr) {
            modifiers.set(modifier.label, modifier.args)
          }

          if (p.mustHaveEmptyExpression && expression.length) {
            throw new Error(`'${dsKey}' must have empty expression`)
          }
          if (p.mustNotEmptyExpression && !expression.length) {
            throw new Error(`'${dsKey}' must have non-empty expression`)
          }

          const processors = [...(p.preprocessors?.pre || []), ...CorePreprocessors, ...(p.preprocessors?.post || [])]
          for (const processor of processors) {
            if (appliedProcessors.has(processor)) continue
            appliedProcessors.add(processor)
            const matches = [...expression.matchAll(processor.regexp)]
            if (matches.length) {
              for (const match of matches) {
                if (!match.groups) continue
                const { groups } = match
                const { whole } = groups
                expression = expression.replace(whole, processor.replacer(groups))
              }
            }
          }

          const { store, reactivity, actions, refs } = this
          const ctx: AttributeContext = {
            store,
            mergeStore: this.mergeStore.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanupElementRemovals: this.cleanupElementRemovals.bind(this),
            walkSignals: this.walkSignals.bind(this),
            actions,
            refs,
            reactivity,
            el,
            key,
            expression,
            expressionFn: () => {
              throw new Error('Expression function not created')
            },
            JSONParse: this.JSONParse,
            JSONStringify: this.JSONStringify,
            modifiers,
          }

          if (!p.bypassExpressionFunctionCreation?.(ctx) && !p.mustHaveEmptyExpression && expression.length) {
            const statements = expression.split(';')
            statements[statements.length - 1] = `return ${statements[statements.length - 1]}`
            const fnContent = `
try {
  ${statements.join(';')}
} catch (e) {
  throw new Error(\`Eval '${expression}' on ${el.id ? `#${el.id}` : el.tagName}\`)
}
            `
            try {
              const fn = new Function('ctx', fnContent) as ExpressionFunction
              ctx.expressionFn = fn
            } catch (e) {
              console.error(e)
              return
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
