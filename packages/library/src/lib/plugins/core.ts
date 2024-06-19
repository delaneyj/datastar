import { sendDatastarEvent } from '..'
import { DATASTAR_STR } from '../core'
import {
  AttributeContext,
  AttributePlugin,
  DatastarEvent,
  Preprocessor,
  RegexpGroups,
  datastarEventName,
} from '../types'

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
    return `document.querySelector(ctx.store()._dsPlugins.refs.${ref})`
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
    let lastOfflineMarshalled = ``
    const offlineFn = ((_: CustomEvent<DatastarEvent>) => {
      const s = ctx.store()
      const marshalledStore = JSON.stringify(s)

      if (marshalledStore !== lastOfflineMarshalled) {
        window.localStorage.setItem(DATASTAR_STR, marshalledStore)
        lastOfflineMarshalled = marshalledStore
      }
    }) as EventListener

    const hasOffline = ctx.modifiers.has('offline')

    if (hasOffline) {
      const marshalledStore = window.localStorage.getItem(DATASTAR_STR) || '{}'
      const store = JSON.parse(marshalledStore)
      ctx.mergeStore(store)

      window.addEventListener(datastarEventName, offlineFn)
    }

    const bodyStore = ctx.expressionFn(ctx)
    const marshalled = JSON.stringify(bodyStore)
    sendDatastarEvent('plugin', 'store', 'merged', ctx.el, marshalled)
    ctx.mergeStore(bodyStore)
    delete ctx.el.dataset.store

    return () => {
      if (hasOffline) {
        window.removeEventListener(datastarEventName, offlineFn)
      }
    }
  },
}

// Sets the value of the element
const RefPlugin: AttributePlugin = {
  prefix: 'ref',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  bypassExpressionFunctionCreation: () => true,
  onLoad: (ctx: AttributeContext) => {
    ctx.upsertIfMissingFromStore('_dsPlugins.refs', {})
    const { el, expression } = ctx
    const s = ctx.store()

    const revised = {
      _dsPlugins: {
        refs: {
          ...s._dsPlugins.refs.value,
          [expression]: elemToSelector(el),
        },
      },
    }
    ctx.mergeStore(revised)

    return () => {
      const s = ctx.store()
      const revised = { ...s._dsPlugins.refs.value }
      delete revised[expression]
      s._dsPlugins.refs = revised
    }
  },
}

export const CorePlugins: AttributePlugin[] = [StoreAttributePlugin, RefPlugin]

export function elemToSelector(elm: Element | null) {
  if (!elm) return 'null'

  if (elm.tagName === 'BODY') return 'BODY'
  const names = []
  while (elm.parentElement && elm.tagName !== 'BODY') {
    if (elm.id) {
      names.unshift('#' + elm.getAttribute('id')) // getAttribute, because `elm.id` could also return a child element with name "id"
      break // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
    } else {
      let c = 1,
        e = elm
      for (; e.previousElementSibling; e = e.previousElementSibling, c++);
      names.unshift(elm.tagName + ':nth-child(' + c + ')')
    }
    elm = elm.parentElement
  }
  return names.join('>')
}
