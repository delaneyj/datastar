import morphdom from 'morphdom'
import { functionEval } from '..'
import {
  WithExpressionArgs,
  addDataExtension,
  toHTMLorSVGElement,
} from '../core'

const p = new DOMParser()
const loadingClass = 'datastar-loading'

// type mergeMode = 'replace' | 'appendChild' | 'morph'

const allowedModifiers = ['replace', 'appendChild']

export function addGetExtension() {
  addDataExtension('get', {
    allowedModifiers,
    withExpression: (args) => fetcher('GET', args),
  })
}

export function addPostExtension() {
  addDataExtension('post', {
    allowedModifiers,
    withExpression: (args) => fetcher('POST', args),
  })
}

export function addPutExtension() {
  addDataExtension('put', {
    allowedModifiers,
    withExpression: (args) => fetcher('PUT', args),
  })
}

export function addPatchExtension() {
  addDataExtension('patch', {
    allowedModifiers,
    withExpression: (args) => fetcher('PATCH', args),
  })
}

export function addDeleteExtension() {
  addDataExtension('delete', {
    allowedModifiers,
    withExpression: (args) => fetcher('DELETE', args),
  })
}

export function addHeadersExtension() {
  addDataExtension('header', {
    withExpression: ({
      name,
      expression,
      dataStack,
      reactivity: { computed },
    }) => {
      const headers = functionEval(dataStack, expression)
      if (typeof headers !== 'object') {
        throw new Error('Headers must be an object')
      }

      return {
        headers: {
          [name.toUpperCase()]: computed(() => headers),
        },
      }
    },
  })
}

function fetcher(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  args: WithExpressionArgs,
) {
  const {
    el: elRaw,
    dataStack,
    expression,
    modifiers,
    reactivity: { computed },
  } = args

  computed(async () => {
    const urlRaw = functionEval(dataStack, expression)
    if (urlRaw !== 'string') throw new Error('url must be a string')

    const el = toHTMLorSVGElement(elRaw)
    if (!el) throw new Error('Element must be an HTMLElement or SVGElement')

    el.classList.add(loadingClass)

    const url = new URL(urlRaw)
    const headers = new Headers()
    headers.append('Accept', 'text/html')
    headers.append('Content-Type', 'application/json')

    if (dataStack?.headers) {
      for (let name in dataStack.headers) {
        const signal = dataStack.headers[name]
        headers.append(name, signal.value)
      }
    }

    const req: RequestInit = { method, headers }
    const dataStackJSON = JSON.stringify(dataStack)
    if (method !== 'GET') {
      const b64 = atob(dataStackJSON)
      url.searchParams.append('dataStack', b64)
    } else {
      req.body = dataStackJSON
    }

    const res = await fetch(url, req)
    if (!res.ok) throw new Error('Network response was not ok.')
    const html = await res.text()

    const dom = p.parseFromString(html, 'text/html').body.childNodes
    for (const frag of dom) {
      if (!(frag instanceof Element)) throw new Error('Not an element')

      const id = frag.getAttribute('id')
      if (!id) throw new Error('No id')

      const el = document.getElementById(id)
      if (!el) throw new Error('No element')

      if (modifiers.has('replace')) {
        el.replaceWith(frag)
      } else if (modifiers.has('appendChild')) {
        el.appendChild(frag)
      } else {
        morphdom(el, frag)
      }
    }

    el.classList.remove(loadingClass)
  })
}
