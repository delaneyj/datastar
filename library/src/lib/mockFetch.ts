export interface MockedResponse {
  html: string
  status?: number
  statusText?: string
  headers?: Headers
}

export interface MockFetchRoutes {
  [url: string]: {
    [method: string]: (req: Request) => Promise<MockedResponse>
  }
}

export function injectMockFetch(routes: MockFetchRoutes) {
  console.warn(`Overriding fetch with mock version, this should only be used in examples.`)
  let realFetch = window.fetch
  const mockFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const req = new Request(url, init)

    if (!(url instanceof URL)) throw new Error(`url must be a URL`)

    const urlMethods = routes[url.pathname]
    if (!urlMethods) {
      return realFetch(url, init)
    }

    const methodFn = urlMethods[req.method]
    if (!methodFn) throw new Error(`No mock route found for ${req.method} ${req.url}`)

    console.log(`Mock fetch ${req.method} ${req.url}`)

    let { html, status, statusText, headers } = await methodFn(req)
    if (!headers) headers = new Headers()
    if (!headers.has('Content-Type')) headers.append('Content-Type', 'text/html')
    status = status || 200
    statusText = statusText || 'OK'

    const res = new Response(html, { status, statusText, headers })
    return res
  }

  window.fetch = mockFetch
}

export type MockSSERoutes = Record<string, string[]>

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function injectMockSSE(routes: MockSSERoutes, interval = 1000) {
  class MockEventSource {
    url: string
    responses: string[]
    emitters = new Map<string, Function[]>()

    constructor(url: string) {
      this.url = url
      this.responses = routes[url]
      if (!this.responses) throw new Error(`No mock SSE route found for ${url}`)

      this.run()
    }

    async run() {
      while (this.responses.length) {
        await sleep(interval)
        const res = this.responses.shift()
        this.emit('message', { data: res })
      }
      this.emit('close', {})
    }

    private emit(event: string, data: any) {
      // console.log(`Emitting ${event} with data`, data)
      if (!this.emitters.has(event)) return
      const fns = this.emitters.get(event)!
      for (const fn of fns) {
        fn(data)
      }
    }

    addEventListener(event: string, fn: Function) {
      if (!this.emitters.has(event)) {
        this.emitters.set(event, [])
      }
      this.emitters.get(event)!.push(fn)
    }

    removeEventListener(event: string, fn: Function) {
      if (!this.emitters.has(event)) return
      const fns = this.emitters.get(event)!
      fns.splice(fns.indexOf(fn), 1)
    }

    close() {
      this.emitters.clear()
    }
  }

  window.EventSource = MockEventSource as any
}
