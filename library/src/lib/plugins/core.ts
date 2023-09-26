import { AttributeContext, AttributePlugin, Preprocesser, RegexpGroups } from '../types'

const SignalProcessor: Preprocesser = {
  name: 'SignalProcessor',
  description: `Replacing $signal with ctx.store.signal.value`,
  regexp: new RegExp(/(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
  replacer: (groups: RegexpGroups) => {
    const { signal } = groups
    return `ctx.store.${signal}.value`
  },
}

const ActionProcessor: Preprocesser = {
  name: 'ActionProcessor',
  description: `Replacing @action(args) with ctx.actions.action(ctx, args)`,
  regexp: new RegExp(/(?<whole>@(?<action>[a-zA-Z_$][0-9a-zA-Z_$]*)(?<call>\((?<args>.*)\))?)/g),
  replacer: ({ action, args }: RegexpGroups) => {
    return `ctx.actions.${action}(ctx, ${args || ''})`
  },
}

const RefProcessor: Preprocesser = {
  name: 'RefProcessor',
  description: `Replacing #foo with ctx.refs.foo`,
  regexp: new RegExp(/(?<whole>\#(?<ref>[a-zA-Z_$][0-9a-zA-Z_$]*))/g),
  replacer({ ref }: RegexpGroups) {
    return `data.refs.${ref}`
  },
}

export const CorePreprocessors: Preprocesser[] = [SignalProcessor, ActionProcessor, RefProcessor]

const BodyStoreAttributePlugin: AttributePlugin = {
  prefix: 'store',
  description: 'Setup the global store',
  allowedTags: new Set(['body']),

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
  preprocessers: new Set([]),

  onLoad: (ctx: AttributeContext) => {
    const { el, expression } = ctx
    ctx.refs[expression] = el
    return () => delete ctx.refs[expression]
  },
}

export const CorePlugins: AttributePlugin[] = [BodyStoreAttributePlugin, RefPlugin]
