import { AttributeContext, AttributePlugin, Preprocesser, RegexpGroups } from '../types'

const validNestedJSIdentifier = `[a-zA-Z_$][0-9a-zA-Z_$.]*`
function wholePrefixSuffix(rune: string, prefix: string, suffix: string) {
  return new RegExp(`(?<whole>\\${rune}(?<${prefix}>${validNestedJSIdentifier})${suffix})`, `g`)
}

// Replacing $signal with ctx.store.signal.value`
const SignalProcessor: Preprocesser = {
  regexp: wholePrefixSuffix('$', 'signal', ''),
  replacer: (groups: RegexpGroups) => {
    const { signal } = groups
    return `ctx.store().${signal}.value`
  },
}

// Replacing $$action(args) with ctx.actions.action(ctx, args)
const ActionProcessor: Preprocesser = {
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
const RefProcessor: Preprocesser = {
  regexp: wholePrefixSuffix('~', 'ref', ''),
  replacer({ ref }: RegexpGroups) {
    return `data.refs.${ref}`
  },
}

export const CorePreprocessors: Preprocesser[] = [ActionProcessor, SignalProcessor, RefProcessor]

// Setup the global store
const MergeStoreAttributePlugin: AttributePlugin = {
  prefix: 'mergeStore',
  preprocessors: {
    pre: [
      {
        // Replacing whole with JSONStringify(whole)
        regexp: /(?<whole>.+)/g,
        replacer: (groups: RegexpGroups) => {
          const { whole } = groups

          return `ctx.JSONParse('${whole.replace(/'/g, `\\'`)}')`
        },
      },
    ],
  },
  onLoad: (ctx: AttributeContext) => {
    const bodyStore = ctx.expressionFn(ctx)
    ctx.mergeStore(bodyStore)
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

export const CorePlugins: AttributePlugin[] = [MergeStoreAttributePlugin, RefPlugin]
