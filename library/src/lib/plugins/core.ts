import { DATASTAR_STR } from '../core'
import { AttributeContext, AttributePlugin, Preprocessor, RegexpGroups } from '../types'

const validNestedJSIdentifier = `[a-zA-Z_$][0-9a-zA-Z_$.]+`
function wholePrefixSuffix(rune: string, prefix: string, suffix: string) {
  return new RegExp(`(?<whole>\\${rune}(?<${prefix}>${validNestedJSIdentifier})${suffix})`, `g`)
}

// Replacing $signal with ctx.store.signal.value`
const SignalProcessor: Preprocessor = {
  regexp: wholePrefixSuffix('$', 'signal', '(?<method>\\([^\\)]*\\))?'),
  replacer: (groups: RegexpGroups) => {
    const { signal, method } = groups
    const prefix = `ctx.store()`
    if (!method?.length) {
      return `${prefix}.${signal}.value`
    }
    const parts = signal.split('.')
    const methodName = parts.pop()
    const nestedSignal = parts.join('.')
    return `${prefix}.${nestedSignal}.value.${methodName}${method}`
  },
}

// Replacing $$action(args) with ctx.actions.action(ctx, args)
const ActionProcessor: Preprocessor = {
  regexp: wholePrefixSuffix('$\\$', 'action', '(?<call>\\((?<args>.*)\\))?'),
  replacer: ({ action, args }: RegexpGroups) => {
    const withCtx = [`ctx`]
    if (args) {
      withCtx.push(...args.split(',').map((x) => x.trim()))
    }
    const argsJoined = withCtx.join(',')
    return `ctx.actions.${action}(${argsJoined})`
  },
}

// Replacing #foo with ctx.refs.foo
const RefProcessor: Preprocessor = {
  regexp: wholePrefixSuffix('~', 'ref', ''),
  replacer({ ref }: RegexpGroups) {
    return `data.refs.${ref}`
  },
}

export const CorePreprocessors: Preprocessor[] = [ActionProcessor, SignalProcessor, RefProcessor]

// Setup the global store
const StoreAttributePlugin: AttributePlugin = {
  prefix: 'store',
  preprocessors: {
    pre: [
      {
        regexp: /(?<whole>.+)/g,
        replacer: (groups: RegexpGroups) => {
          const { whole } = groups
          return `Object.assign({...ctx.store()}, ${whole})`
        },
      },
    ],
  },
  allowedModifiers: new Set(['offline']),
  onLoad: (ctx: AttributeContext) => {
    if (ctx.modifiers.has('offline')) {
      // load from local storage
      const marshalledStore = window.localStorage.getItem(DATASTAR_STR) || '{}'
      const store = JSON.parse(marshalledStore)
      ctx.mergeStore(store)

      // save on every change
    }
    const bodyStore = ctx.expressionFn(ctx)
    ctx.mergeStore(bodyStore)
    delete ctx.el.dataset.store
  },
}

// Sets the value of the element
const RefPlugin: AttributePlugin = {
  prefix: 'ref',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    const { el, expression } = ctx
    ctx.refs[expression] = el
    return () => delete ctx.refs[expression]
  },
}

export const CorePlugins: AttributePlugin[] = [StoreAttributePlugin, RefPlugin]
