import { Actions, AttributeContext } from '..'

const fit = (_: AttributeContext, v: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
  return ((v - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
}

const fitInt = (ctx: AttributeContext, v: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
  return Math.round(fit(ctx, v, oldMin, oldMax, newMin, newMax))
}

const clampFit = (_: AttributeContext, v: number, oldMin: number, oldMax: number, newMin: number, newMax: number) => {
  return Math.max(newMin, Math.min(newMax, fit(_, v, oldMin, oldMax, newMin, newMax)))
}

const clampFitInt = (
  _: AttributeContext,
  v: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
) => {
  return Math.round(clampFit(_, v, oldMin, oldMax, newMin, newMax))
}

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
  fit,
  fitInt,
  clampFit,
  clampFitInt,
}
