import { NamespacedReactiveRecords, SIGNAL, functionGenerator } from '..'
import { addDataExtension } from '../core'

const THROTTLE = 'throttle',
  DEBOUNCE = 'debounce',
  LEADING = 'leading',
  ONCE = 'once',
  IDLE = 'idle'

export const ON = Symbol('on')
export function addOnDataExtension() {
  addDataExtension(ON, {
    requiredExtensions: [SIGNAL],
    allowedModifiers: [THROTTLE, DEBOUNCE, ONCE, IDLE],
    withExpression: ({
      name,
      el,
      dataStack,
      hasMod,
      withMod,
      expression,
      reactivity: { effect, onCleanup, computed },
    }) => {
      const signalFn = functionGenerator(expression)

      const hasOnce = hasMod(ONCE)
      const throttleMod = withMod(THROTTLE)
      const debounceMod = withMod(DEBOUNCE)
      const hasLeading = hasMod(LEADING)

      const fn = () => signalFn(dataStack)
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
