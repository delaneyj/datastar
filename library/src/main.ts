import { datastar } from './lib'
import { injectMockFetch, injectMockSSE } from './lib/mockFetch'

injectMockFetch({
  '/api/simple': {
    GET: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        html: `<p>I'm a html fragment from a simple GET request</p>`,
      }
    },
    POST: async (req) => {
      const clientReactiveStore = await req.json()
      return {
        html: `
                  <div>
                      <h1>I'm a html fragment from a simple POST request</h1>
                      <pre>${JSON.stringify(clientReactiveStore, null, 2)}</pre>
                  </div>
              `,
      }
    },
  },
  '/api/redirect': {
    GET: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        html: 'https://www.google.com',
      }
    },
  },
})

injectMockSSE({
  '/api/sse': [`<p>I'm am SSE response 1</p>`, `<p>I'm am SSE response 2</p>`, `<p>I'm am SSE response 3</p>`],
})

datastar.run()
const foo = datastar.refs.foo as HTMLCanvasElement
foo.classList.add('bg-primary', 'w-32', 'h-32', 'rounded-full')
foo.setAttribute('width', '128px')
foo.setAttribute('height', '128px')
const ctx = foo.getContext('2d')!
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillStyle = 'white'
ctx.fillText('Used data-ref to modify', 64, 64)
