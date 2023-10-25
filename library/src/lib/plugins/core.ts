import { AttributeContext, AttributePlugin, Preprocesser, RegexpGroups } from '../types'

const validJSIdentifier = `[a-zA-Z_$][0-9a-zA-Z_$]*`
const wholePrefixSuffix = (rune: string, prefix: string, call: string) =>
  new RegExp(`(?<whole>\\${rune}(?<${prefix}>${validJSIdentifier}))${call}`, `g`)

const SignalProcessor: Preprocesser = {
  name: 'SignalProcessor',
  description: `Replacing $signal with ctx.store.signal.value`,
  regexp: wholePrefixSuffix('$', 'signal', ''),
  replacer: (groups: RegexpGroups) => {
    const { signal } = groups
    return `ctx.store.${signal}.value`
  },
}

const ActionProcessor: Preprocesser = {
  name: 'ActionProcessor',
  description: `Replacing @action(args) with ctx.actions.action(ctx, args)`,
  regexp: wholePrefixSuffix('@', 'action', '(?<call>\\((?<args>.*)\\))?'),
  replacer: ({ action, args }: RegexpGroups) => {
    return `ctx.actions.${action}(ctx, ${args || ''})`
  },
}

const RefProcessor: Preprocesser = {
  name: 'RefProcessor',
  description: `Replacing #foo with ctx.refs.foo`,
  regexp: wholePrefixSuffix('~', 'ref', ''),
  replacer({ ref }: RegexpGroups) {
    return `data.refs.${ref}`
  },
}

export const CorePreprocessors: Preprocesser[] = [SignalProcessor, ActionProcessor, RefProcessor]

const MergeStoreAttributePlugin: AttributePlugin = {
  prefix: 'mergeStore',
  description: 'Setup the global store',

  onLoad: (ctx: AttributeContext) => {
    const bodyStore = ctx.expressionFn(ctx)
    ctx.mergeStore(bodyStore)
  },
}

const RefPlugin: AttributePlugin = {
  prefix: 'ref',
  description: 'Sets the value of the element',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  bypassExpressionFunctionCreation: true,
  preprocessors: new Set([]),

  onLoad: (ctx: AttributeContext) => {
    const { el, expression } = ctx
    ctx.refs[expression] = el
    return () => delete ctx.refs[expression]
  },
}

export const CorePlugins: AttributePlugin[] = [MergeStoreAttributePlugin, RefPlugin]
