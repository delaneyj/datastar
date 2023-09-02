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

  const mockFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const req = new Request(url, init)

    const urlMethods = routes[req.url]
    if (!urlMethods) throw new Error(`No mock route found for ${req.url}`)

    const methodFn = urlMethods[req.method]
    if (!methodFn) throw new Error(`No mock route found for ${req.method} ${req.url}`)

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
