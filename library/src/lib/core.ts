import { toHTMLorSVGElement } from './dom'
import { DeepSignal, DeepState, deepSignal } from './external/deepsignal'
import { computed, effect, signal } from './external/preact-core'
import { apply } from './external/ts-merge-patch'
import { CorePlugins, CorePreprocessors } from './plugins/core'
import {
  Actions,
  AttributeContext,
  AttributePlugin,
  ExpressionFunction,
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
  missingIDNext = 0
  removals = new Map<Element, Set<OnRemovalFn>>()

  constructor(actions: Actions = {}, ...plugins: AttributePlugin[]) {
    this.actions = Object.assign(this.actions, actions)
    plugins = [...CorePlugins, ...plugins]
    if (!plugins.length) throw new Error('No plugins provided')

    const allPluginPrefixes = new Set<string>()
    for (const p of plugins) {
      if (p.requiredPluginPrefixes) {
        for (const requiredPluginType of p.requiredPluginPrefixes) {
          if (!allPluginPrefixes.has(requiredPluginType)) {
            throw new Error(`Plugin ${p.prefix} requires plugin ${requiredPluginType}`)
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

  private mergeStore(store: DeepState) {
    const revisedStore = apply(this.store.value, store) as DeepState
    this.store = deepSignal(revisedStore)
  }

  applyPlugins(rootElement: Element) {
    const appliedProcessors = new Set<Preprocesser>()

    this.plugins.forEach((p, pi) => {
      walkDownDOM(rootElement, (element) => {
        if (pi === 0) this.cleanupElementRemovals(element)

        const el = toHTMLorSVGElement(element)
        if (!el) return

        if (el.id) {
          // TODO: Remove this hack once CSSStyleDeclaration supports viewTransitionName
          const styl = el.style as any
          styl.viewTransitionName = el.id
          // console.log(`Setting viewTransitionName on ${el.id}`)
        }
        if (!el.id && el.tagName !== 'BODY') {
          const id = (this.missingIDNext++).toString(16).padStart(8, '0')
          el.id = `ds${id}`
        }

        for (const dsKey in el.dataset) {
          let expression = el.dataset[dsKey] || ''

          if (!dsKey.startsWith(p.prefix)) continue

          appliedProcessors.clear()
          // console.info(`Found ${dsKey} on ${el.id ? `#${el.id}` : el.tagName}, applying Datastar plugin '${p.prefix}'`)

          if (p.allowedTags && !p.allowedTags.has(el.tagName.toLowerCase())) {
            throw new Error(
              `Tag '${el.tagName}' is not allowed for plugin '${dsKey}', allowed tags are: ${[
                [...p.allowedTags].map((t) => `'${t}'`),
              ].join(', ')}`,
            )
          }

          let keyRaw = dsKey.slice(p.prefix.length)
          let [key, ...modifiersWithArgsArr] = keyRaw.split('.')
          if (p.mustHaveEmptyKey && key.length > 0) {
            throw new Error(`Attribute '${dsKey}' must have empty key`)
          }
          if (p.mustNotEmptyKey && key.length === 0) {
            throw new Error(`Attribute '${dsKey}' must have non-empty key`)
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
                throw new Error(`Modifier '${modifier.label}' is not allowed`)
              }
            }
          }
          const modifiers = new Map<string, string[]>()
          for (const modifier of modifiersArr) {
            modifiers.set(modifier.label, modifier.args)
          }

          if (p.mustHaveEmptyExpression && expression.length) {
            throw new Error(`Attribute '${dsKey}' must have empty expression`)
          }
          if (p.mustNotEmptyExpression && !expression.length) {
            throw new Error(`Attribute '${dsKey}' must have non-empty expression`)
          }

          const processors = [...CorePreprocessors, ...(p.preprocessers || [])]
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
            actions,
            refs,
            reactivity,
            el,
            key,
            expression,
            expressionFn: () => {
              throw new Error('Expression function not created')
            },
            modifiers,
          }

          if (!p.bypassExpressionFunctionCreation && !p.mustHaveEmptyExpression && expression.length) {
            const fnContent = `return ${expression}`
            try {
              const fn = new Function('ctx', fnContent) as ExpressionFunction
              ctx.expressionFn = fn
            } catch (e) {
              console.error(`Error evaluating expression '${fnContent}' on ${el.id ? `#${el.id}` : el.tagName}`)
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
}

function walkDownDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.firstElementChild

  while (el) {
    walkDownDOM(el, callback)
    el = el.nextElementSibling
  }
}
