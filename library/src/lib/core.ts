import { effect, getContext, onDispose, root, setContext } from '@maverick-js/signals'
import { functionEval, toHTMLorSVGElement, walkDownDOM } from './dom'
import {
  AttributeContext,
  AttributePlugin,
  DatastarPlugin,
  DatastarPluginConstructor,
  HTMLorSVGElement,
  RunePlugin,
} from './types'

export class Datastar {
  attributePlugins: AttributePlugin[] = []
  runePlugins: RunePlugin[] = []
  attributeObserver: MutationObserver

  constructor(...plugins: DatastarPluginConstructor[]) {
    if (!plugins.length) throw new Error('No plugins provided')

    this.attributeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          const el = toHTMLorSVGElement(m.target)
          if (!el) return

          // Old
          this.handleAttributePlugin(el, (p, ctx) => {
            p.onUnmount?.(ctx)
            p.onMount(ctx)
          })
        } else {
          m.removedNodes.forEach((node) => {
            const el = toHTMLorSVGElement(node)
            if (!el) return

            this.handleAttributePlugin(el, (p, ctx) => {
              p.onUnmount?.(ctx)
            })
          })
        }
      }
    })

    this.attributeObserver.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      subtree: true,
      childList: true,
    })

    const allPlugins: DatastarPlugin[] = []
    for (const Plugin of plugins) {
      const p = new Plugin()

      p.requiredPluginTypes.forEach((requiredPluginType) => {
        const requiredPlugin = allPlugins.find((plugin) => plugin instanceof requiredPluginType)
        if (!requiredPlugin) {
          throw new Error(`Plugin "${p.name}" requires plugin "${requiredPluginType.name}"`)
        }

        if (p instanceof AttributePlugin) {
          if (p.allowedTags) {
            p.allowedTags = new Set([...p.allowedTags].map((t) => t.toLowerCase()))
          }
          this.attributePlugins.push(p)
        } else if (p instanceof RunePlugin) {
          this.runePlugins.push(p)
        } else {
          throw new Error(`Unknown plugin type`)
        }

        allPlugins.push(p)
      })
    }
  }

  run() {
    walkDownDOM(document.body, (element) => {
      const el = toHTMLorSVGElement(element)
      if (!el) return

      let hasAttributePlugin = false
      const reactiveRootDisposal = root((dispose) => {
        this.handleAttributePlugin(el, (p, ctx) => {
          p.onMount(ctx)
          hasAttributePlugin = true
        })

        return dispose
      })

      if (!hasAttributePlugin) reactiveRootDisposal()
    })
  }

  private handleAttributePlugin(el: HTMLorSVGElement, cb: (p: AttributePlugin, ctx: AttributeContext) => void) {
    this.attributePlugins.forEach((p) => {
      if (p.allowedTags) {
        const elTagLower = el.tagName.toLowerCase()
        if (!p.allowedTags.has(elTagLower)) return
      }

      const fullPrefix = `data-${p.prefix}`

      for (const attr of el.attributes) {
        if (!attr.name.startsWith(fullPrefix)) continue

        let keyRaw = attr.name.slice(fullPrefix.length)
        if (keyRaw.startsWith('-')) keyRaw = keyRaw.slice(1)

        const [key, ...modifiersWithArgsArr] = keyRaw.split('.')

        if (p.mustHaveEmptyKey && key.length > 0) {
          throw new Error(`Attribute '${attr.name}' must have empty key`)
        }

        const modifiersArr = modifiersWithArgsArr.map((m) => {
          const [label, ...args] = m.split('_')
          return { label, args }
        })
        const expressionRaw = attr.value

        if (p.mustHaveEmptyExpression && expressionRaw?.length > 0) {
          throw new Error(`Attribute '${attr.name}' must have empty expression`)
        }

        if (p.allowedModifiers) {
          for (const modifier of modifiersArr) {
            if (!p.allowedModifiers.has(modifier.label)) {
              throw new Error(`Modifier '${modifier.label}' is not allowed`)
            }

            if (p.allowedModifierArgs) {
              const allowedArgs = p.allowedModifierArgs[modifier.label]
              if (allowedArgs) {
                if (!allowedArgs(modifier.args)) {
                  throw new Error(`Modifier '${modifier.label}' arguments are not allowed`)
                }
              }
            }
          }
        }

        const modifiers = new Map<string, string[]>()
        for (const modifier of modifiersArr) {
          modifiers.set(modifier.label, modifier.args)
        }

        const ctx: AttributeContext = {
          get(k: string) {
            return getContext(k)
          },
          set(k, v) {
            setContext(k, v)
          },
          el,
          key,
          expressionRaw,
          modifiers,
          effect,
          cleanup: onDispose,
        }

        ctx.expressionEvaluated = functionEval(ctx)

        cb(p, ctx)
      }
    })
  }
}
