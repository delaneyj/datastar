// Authors: Delaney Gillilan
// Icon: material-symbols:settings-input-antenna
// Slug: Merge signals using a Server-Sent Event
// // Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { InitExpressionFunction, WatcherPlugin } from "../../../../engine";
import {
  DefaultMergeSignalsOnlyIfMissing,
  EventTypes,
} from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { isBoolString } from "../../../../utils/text";
import { datastarSSEEventWatcher } from "./sseShared";

export const MergeSignals: WatcherPlugin = {
  type: PluginType.Watcher,
  name: EventTypes.MergeSignals,
  onGlobalInit: async (ctx) => {
    datastarSSEEventWatcher(
      EventTypes.MergeSignals,
      ({
        signals: raw = "{}",
        onlyIfMissing: onlyIfMissingRaw = `${DefaultMergeSignalsOnlyIfMissing}`,
      }) => {
        const { signals } = ctx;
        const onlyIfMissing = isBoolString(onlyIfMissingRaw);
        const fnContents = ` return Object.assign({...ctx.signals}, ${raw})`;
        try {
          const fn = new Function("ctx", fnContents) as InitExpressionFunction;
          const possibleMergeSignals = fn(ctx);
          signals.merge(possibleMergeSignals, onlyIfMissing);
          ctx.applyPlugins(document.body);
        } catch (e) {
          console.log(fnContents);
          console.error(e);
          debugger;
        }
      },
    );
  },
};
