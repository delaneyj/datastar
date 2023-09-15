import { NamespacedReactiveRecords, SIGNAL, functionGenerator, mergeHTMLFragments } from '..'
import { addDataPlugin } from '../core'

export const SSE = 'sse'

export function addOnDataPlugin() {
  addDataPlugin(SSE, {
    requiredPlugins: [SIGNAL],
    withExpression: ({ el, name, expression, dataStack, reactivity: { effect, onCleanup }, actions }) => {
      const signalFn = functionGenerator(expression)

      let evtSource: EventSource

      const elementData: NamespacedReactiveRecords = {
        sse: {
          [name]: effect(() => {
            if (evtSource) evtSource.close()

            const evtSrcURL = signalFn(el, dataStack, actions)
            if (typeof evtSrcURL !== 'string') throw new Error('Event source URL must be a string')

            evtSource = new EventSource(evtSrcURL, {
              withCredentials: true,
            })

            evtSource.addEventListener('message', (evt) => {
              mergeHTMLFragments(el, evt.data)
            })

            evtSource.addEventListener('error', (evt) => {
              console.error('SSE error', evt)
            })

            onCleanup(() => {
              evtSource.close()
            })
          }),
        },
      }

      return elementData
    },
  })
}
