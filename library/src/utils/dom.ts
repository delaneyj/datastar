import { DATASTAR } from '~/engine/consts'

export function elUniqId(el: Element) {
  if (el.id) return el.id
  let hash = 0
  const hashUpdate = (n: number) => {
    hash = (hash << 5) - hash + n
    return hash & hash
  }
  const hashUpdateFromStr = (str: string) =>
    str.split('').forEach((c) => hashUpdate(c.charCodeAt(0)))

  while (el.parentNode) {
    if (el.id) {
      hashUpdateFromStr(`${el.id}`)
      break
    } else {
      if (el === el.ownerDocument.documentElement) {
        hashUpdateFromStr(el.tagName)
      } else {
        for (
          let i = 1, e = el;
          e.previousElementSibling;
          e = e.previousElementSibling, i++
        ) {
          hashUpdate(i)
        }
        el = el.parentNode as Element
      }
    }
    el = el.parentNode as Element
  }
  return DATASTAR + hash
}

export function onElementRemoved(element: Element, callback: () => void) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const removedNode of mutation.removedNodes) {
        if (removedNode === element) {
          observer.disconnect()
          callback()
          return
        }
      }
    }
  })
  observer.observe(element.parentNode as Node, { childList: true })
}
