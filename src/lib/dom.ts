export function walkDownDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.firstElementChild

  while (el) {
    walkDownDOM(el, callback)
    el = el.nextElementSibling
  }
}

export function walkUpDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.parentElement
  walkUpDOM(el, callback)
}
