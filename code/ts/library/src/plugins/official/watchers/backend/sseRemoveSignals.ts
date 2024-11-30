// Authors: Delaney Gillilan
// Icon: material-symbols:settings-input-antenna
// Slug: Remove signals using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { EventTypes } from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { WatcherPlugin } from "../../../../engine/types";
import { datastarSSEEventWatcher } from "./sseShared";

export const RemoveSignals: WatcherPlugin = {
  pluginType: PluginType.Watcher,
  name: EventTypes.RemoveSignals,
  onGlobalInit: async (ctx) => {
    datastarSSEEventWatcher(
      EventTypes.RemoveSignals,
      ({ paths: pathsRaw = "" }) => {
        const paths = pathsRaw.split("\n").map((p) => p.trim());
        if (!!!paths?.length) {
          // NO_PATHS – No paths were provided. At least one path must be provided to the `remove-signals` event.
          throw ERR_BAD_ARGS;
        }
        ctx.removeSignals(...paths);
      }
    );
  },
};
