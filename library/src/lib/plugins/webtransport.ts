import { AttributeContext, AttributePlugin } from '../types'

// Sets the value of the element
export const WebTransportPlugin: AttributePlugin = {
  prefix: 'transport',
  mustHaveEmptyKey: true,
  mustNotEmptyExpression: true,
  allowedModifiers: new Set(['throughput', 'latency', 'pooled', 'unreliable']),

  onLoad: (ctx: AttributeContext) => {
    let wt: WebTransport | null = null

    const fn = async () => {
      const { expressionFn } = ctx
      const url = expressionFn(ctx)

      const opts: WebTransportOptions = {
        congestionControl: 'default',
        allowPooling: false,
        requireUnreliable: false,
      }
      if (ctx.modifiers.has('pooled')) {
        opts.allowPooling = true
      }
      if (ctx.modifiers.has('unreliable')) {
        opts.requireUnreliable = true
      }
      if (ctx.modifiers.has('throughput')) {
        opts.congestionControl = 'throughput'
      }
      if (ctx.modifiers.has('latency')) {
        opts.congestionControl = 'low-latency'
      }

      wt = new WebTransport(url, opts)
      await wt.ready

      const { readable, writable } = await wt.createBidirectionalStream()
      const reader = readable.getReader()
      const writer = writable.getWriter()

      // this needs obvious work to be useful
      writer.write(new TextEncoder().encode('Hello, World!'))
      reader.read().then((result) => {
        console.log('Received:', new TextDecoder().decode(result.value!))
      })
    }

    fn()

    return () => {
      if (wt) {
        wt.close()
      }
    }
  },
}
