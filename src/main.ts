import 'iconify-icon'
import 'unfonts.css'
import { addAllIncludedExtensions, injectMockFetch } from './lib'
import './main.css'

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
      <pre data-swap="after">${JSON.stringify(dataStack, null, 2)}</pre>
      <div id="foo">Bar</div>
      `,
      }
    },
  },
})

addAllIncludedExtensions()
