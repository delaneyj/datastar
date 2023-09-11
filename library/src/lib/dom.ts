export function walkDownDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.firstElementChild

  while (el) {
    walkDownDOM(el, callback)
    el = el.nextElementSibling
  }
}

/**
 * Walks up the DOM tree, starting from the given element, and calls the callback for each element.
 * @param el The element to start from.
 * @param callback The callback to call for each element.
 */
export function walkUpDOM(el: Element | null, callback: (el: Element) => void) {
  if (!el) return
  callback(el)

  el = el.parentElement
  walkUpDOM(el, callback)
}
