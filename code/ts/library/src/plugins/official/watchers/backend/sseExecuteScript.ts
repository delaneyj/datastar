// Authors: Delaney Gillilan
// Icon: tabler:file-type-js
// Slug: Execute JavaScript using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { WatcherPlugin } from "../../../../engine/types";

import {
  DefaultExecuteScriptAttributes,
  DefaultExecuteScriptAutoRemove,
  EventTypes,
} from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { isBoolString } from "../../../../utils/text";
import { datastarSSEEventWatcher } from "./sseShared";

export const ExecuteScript: WatcherPlugin = {
  pluginType: PluginType.Watcher,
  name: EventTypes.ExecuteScript,
  onGlobalInit: async () => {
    datastarSSEEventWatcher(
      EventTypes.ExecuteScript,
      ({
        autoRemove: autoRemoveRaw = `${DefaultExecuteScriptAutoRemove}`,
        attributes: attributesRaw = DefaultExecuteScriptAttributes,
        script,
      }) => {
        const autoRemove = isBoolString(autoRemoveRaw);
        if (!script?.length) {
          // No script provided
          throw ERR_BAD_ARGS;
        }
        const scriptEl = document.createElement("script");
        attributesRaw.split("\n").forEach((attr) => {
          const pivot = attr.indexOf(" ");
          const key = pivot ? attr.slice(0, pivot) : attr;
          const value = pivot ? attr.slice(pivot) : "";
          scriptEl.setAttribute(key.trim(), value.trim());
        });
        scriptEl.text = script;
        document.head.appendChild(scriptEl);
        if (autoRemove) {
          scriptEl.remove();
        }
      },
    );
  },
};
