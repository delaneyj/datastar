import { datastar } from './lib'
import { injectMockFetch, injectMockSSE } from './lib/mockFetch'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

injectMockFetch({
  '/api/simple': {
    GET: async () => {
      await sleep(1000)
      return {
        html: `<p>I'm a html fragment from a simple GET request</p>`,
      }
    },
    POST: async (req) => {
      await sleep(1000)
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
      await sleep(1000)
      return {
        html: 'https://www.google.com',
      }
    },
  },
})

injectMockSSE(
  {
    '/api/sse': [...Array(100).keys()].map((k) => `<p>I'm SEE response ${k}</p>`),
  },
  400,
)

datastar.run()
// const foo = datastar.refs.foo as HTMLCanvasElement
// foo.classList.add('bg-primary', 'w-32', 'h-32', 'rounded-full')
// foo.setAttribute('width', '128px')
// foo.setAttribute('height', '128px')
// const ctx = foo.getContext('2d')!
// ctx.textAlign = 'center'
// ctx.textBaseline = 'middle'
// ctx.fillStyle = 'white'
// ctx.fillText('Used data-ref to modify', 64, 64)
