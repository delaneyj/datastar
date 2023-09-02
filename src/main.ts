import './main.css'

import { addAllIncludedExtensions } from './lib/datastar'
import { injectMockFetch } from './lib/mockFetch'

addAllIncludedExtensions()
injectMockFetch({
  '/api/echo': {
    GET: async (req) => {
      const dataStack = await req.json()
      return {
        html: `<pre>${JSON.stringify(dataStack, null, 2)}</pre>`,
      }
    },
  },
})
