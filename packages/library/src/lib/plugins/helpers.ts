import { Actions } from '..'

export const HelperActions: Actions = {
  setAll: (ctx, regexp, newValue) => {
    const re = new RegExp(regexp)
    ctx.walkSignals((name, signal) => re.test(name) && (signal.value = newValue))
  },
  toggleAll: (ctx, regexp) => {
    const re = new RegExp(regexp)
    ctx.walkSignals((name, signal) => re.test(name) && (signal.value = !signal.value))
  },
  clipboard: (_, text) => {
    if (!navigator.clipboard) throw new Error('Clipboard API not available')
    navigator.clipboard.writeText(text)
  },
}
