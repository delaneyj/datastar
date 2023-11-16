import { Actions } from '..'

export const HelperActions: Actions = {
  setAll: async (ctx, regexp, newValue) => {
    const re = new RegExp(regexp)
    Object.keys(ctx.store)
      .filter((k) => re.test(k))
      .forEach((k) => {
        ctx.store[k].value = newValue
      })
  },
  toggleAll: async (ctx, regexp) => {
    const re = new RegExp(regexp)
    Object.keys(ctx.store)
      .filter((k) => re.test(k))
      .forEach((k) => {
        ctx.store[k].value = !ctx.store[k].value
      })
  },
}
