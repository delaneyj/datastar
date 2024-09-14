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
        /** TODO this needs to be attached to some hook to correctly apply change and avoid elments moving on page
         * need help to correctly attach this and not to use timeout 
        */
        setTimeout(() => {
          // ctx.mergeStore({ ...ctx.store.value, ...history.state.store })
          ctx.applyPlugins(document.body)
        }, 120)
      }
      if (!window.history.state) {
        window.location.replace(window.location.href)
      }
    });


    ctx.eventProcessors[prefix] = (ctx: AttributeContext, _evt: EventSourceMessage, line: string) => {
      if (parseline(ctx.rawExpression)) {
        window.history.pushState({ ...parseline(ctx.rawExpression), ...{ store: ctx.store().value } }, '', line);
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