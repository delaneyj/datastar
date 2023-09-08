import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataExtension } from '../core'

export const ON = 'on'

const ONCE = 'once',
  THROTTLE = 'throttle',
  DEBOUNCE = 'debounce',
  LEADING = 'leading'

export function addOnDataExtension() {
  addDataExtension(ON, {
    requiredExtensions: [SIGNAL],
    allowedModifiers: [ONCE, THROTTLE, DEBOUNCE, LEADING],
    withExpression: ({
      el,
      name,
      hasMod,
      withMod,
      expression,
      dataStack,
      reactivity: { computed, effect, onCleanup },
      actions,
    }) => {
      const signalFn = functionGenerator(expression)

      const hasOnce = hasMod(ONCE)
      const throttleMod = withMod(THROTTLE)
      const debounceMod = withMod(DEBOUNCE)
      const hasLeading = hasMod(LEADING)

      if (name === 'load') {
        document.addEventListener('DOMContentLoaded', () => signalFn(el, dataStack, actions), true)
        return
      }

      const fn = () => signalFn(el, dataStack, actions)
      let wrappedFnCallback: Function = fn
      let callback: () => void

      if (hasOnce) {
        wrappedFnCallback = () => {
          fn()
          if (callback) {
            el.removeEventListener(name, callback)
          }
        }
      } else if (!!throttleMod) {
        const [throttleTimeRaw] = throttleMod.args
        const throttleTime = throttleTimeRaw ? Number(throttleTimeRaw) : 1000

        let prev = 0
        const throttledFn = computed(() => {
          const now = Date.now()
          const delta = now - prev
          if (delta >= throttleTime) {
            prev = now
            return fn()
          }
        })

        wrappedFnCallback = () => throttledFn.value
      } else if (!!debounceMod) {
        const [debounceTimeRaw] = debounceMod.args
        const debounceTime = debounceTimeRaw ? Number(debounceTimeRaw) : 1000

        let timerID: ReturnType<typeof setTimeout> | undefined
        const debouncedFn = computed(() => {
          if (hasLeading && !timerID) {
            fn()
          }
          clearTimeout(timerID)
          timerID = setTimeout(() => {
            if (hasLeading) timerID = undefined
            else fn()
          }, debounceTime)
        })

        wrappedFnCallback = () => debouncedFn.value
      }

      callback = () => wrappedFnCallback()

      el.addEventListener(name, callback)

      const elementData: NamespacedReactiveRecords = {
        on: {
          [name]: effect(() => {
            onCleanup(() => {
              if (hasOnce) return

              el.removeEventListener(name, callback)
            })
          }),
        },
      }

      return elementData
    },
  })
}
