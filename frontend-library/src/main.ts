import 'iconify-icon'
import 'unfonts.css'
import { addAllIncludedExtensions, injectMockFetch } from './lib'
import './main.css'

import favIconSvg from './assets/favicon.svg'
const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/png'
link.href = favIconSvg
document.head.appendChild(link)

import bgPng from './assets/bg.png'
const bg = document.querySelector('#banner') as HTMLDivElement
if (!bg) throw new Error('No banner found')
bg.setAttribute('style', `background-image: url(${bgPng})`)

let count = 0
injectMockFetch({
  '/api/echo': {
    GET: async (req) => {
      const queryString = req.url.split('?')[1]
      const searchParams = new URLSearchParams(queryString)
      const dsJSON = searchParams.get('dataStack')
      if (!dsJSON) throw new Error('No dataStack found in query params')
      const dataStack = JSON.parse(dsJSON)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        html: `
      <button
      data-swap="after"
      class="btn btn-secondary btn-lg"
      data-signal-get="'/api/echo'"
      x-data-on-load="@get"
      data-on-click="@get"
    >
      <span>Contents</span>
      <iconify-icon
        class="datastar-indicator"
        icon="svg-spinners:blocks-wave"
      ></iconify-icon>
      </button>
      <div id="foo" data-swap="after">
      <div>Bar ${count++}</div>
      <pre >${JSON.stringify(dataStack, null, 2)}</pre>
      </div>
      `,
      }
    },
  },
})

addAllIncludedExtensions()
