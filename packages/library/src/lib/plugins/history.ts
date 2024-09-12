import type { AttributeContext, AttributePlugin } from '../types'
import type { EventSourceMessage } from '../external/fetch-event-source'

const prefix = 'history'

export const HistoryPush: AttributePlugin = {
  prefix: prefix,
  onGlobalInit: (ctx) => {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.method && event.state.url) {
        ctx.actions[event.state.method](
          { ...ctx, ...{ store: () => ctx.store } } as AttributeContext,
          event.state.url,
          true
        )
      }
      if (!window.history.state) {
        window.location.replace(window.location.href)
      }
    });


    ctx.eventProcessors[prefix] = (ctx: AttributeContext, _evt: EventSourceMessage, line: string) => {
      if (parseline(ctx.rawExpression)) {
        window.history.pushState(parseline(ctx.rawExpression), '', line);
      }
    }
  },
  onLoad: (_ctx) => { },
}

export const BrowserHistoryPlugins: AttributePlugin[] = [HistoryPush]

const parseline = (rawExpression: string): Record<string, string> | undefined => {
  const regex = /(?<method>\w*)\(['"](?<url>.*)['"]\)$/gmi
  const match = regex.exec(rawExpression);
  return match?.groups;
}