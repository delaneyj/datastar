import { Actions } from '..'

export const HelperActions: Actions = {
  setAll: async (ctx, regexp, newValue) => {
    const re = new RegExp(regexp)
    ctx.walkSignals((name, signal) => re.test(name) && (signal.value = newValue))
  },
  toggleAll: async (ctx, regexp) => {
    const re = new RegExp(regexp)
    ctx.walkSignals((name, signal) => re.test(name) && (signal.value = !signal.value))
  },
}
