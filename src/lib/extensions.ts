import { addDataExtension } from './core'
import { functionEval, functionGenerator } from './eval'
import { NamespacedReactiveRecords } from './types'

const signalRexep = new RegExp(
  /(?<whole>\$(?<signal>[a-zA-Z_$][0-9a-zA-Z_$]*))/g,
)

export function addSignalDataExtension() {
  addDataExtension('signal', {
    preprocessExpression: (str) => {
      // turn $signal into data.signals.signal.value
      const matches = [...str.matchAll(signalRexep)]
      console.log({ matches })
      for (const match of matches) {
        if (!match.groups) continue
        const { whole, signal } = match.groups
        str = str.replace(whole, `data.signals.${signal}.value`)
      }
      return str
    },
    withExpression: ({ name, expression, reactivity }) => {
      return {
        signals: {
          [name]: reactivity.signal(functionEval({}, expression)),
        },
      }
    },
  })
}

export function addOnDataExtension() {
  addDataExtension('on', {
    withExpression: ({
      name,
      el,
      dataStack,
      expression,
      reactivity: { effect, onCleanup },
    }) => {
      const signalFn = functionGenerator(expression)
      const fn = () => signalFn(dataStack)

      el.addEventListener(name, fn)

      const elementData: NamespacedReactiveRecords = {
        on: {
          name: effect(() => {
            onCleanup(() => {
              el.removeEventListener(name, fn)
            })
          }),
        },
      }

      return elementData
    },
  })
}

export function addTextDataExtension() {
  addDataExtension('text', {
    withExpression: ({ el, expression, dataStack, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      const elementData: NamespacedReactiveRecords = {
        text: {
          name: effect(() => {
            if (!dataStack?.signals) return
            const res = signalFn(dataStack)
            el.textContent = `${res}`
          }),
        },
      }

      return elementData
    },
  })
}

export function addShowDataExtension() {
  addDataExtension('show', {
    withExpression: ({ el, dataStack, expression, reactivity: { effect } }) => {
      const signalFn = functionGenerator(expression)

      if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
        throw new Error('Element must have a style property')
      }

      const elementData: NamespacedReactiveRecords = {
        show: {
          name: effect(() => {
            const shouldShow = !!signalFn(dataStack)
            el.style.display = shouldShow ? '' : 'none'
          }),
        },
      }

      return elementData
    },
  })
}

export function addDefaultExtensions() {
  addSignalDataExtension()
  addOnDataExtension()
  addTextDataExtension()
  addShowDataExtension()
}
