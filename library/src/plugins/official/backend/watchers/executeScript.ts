// Icon: tabler:file-type-js
// Slug: Execute JavaScript using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import {
    DefaultExecuteScriptAttributes,
    DefaultExecuteScriptAutoRemove,
    EventTypes,
} from "../../../../engine/consts";
import { dsErr } from "../../../../engine/errors";
import { PluginType, WatcherPlugin } from "../../../../engine/types";
import { isBoolString } from "../../../../utils/text";
import { datastarSSEEventWatcher } from "../shared";

export const ExecuteScript: WatcherPlugin = {
    type: PluginType.Watcher,
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
                    throw dsErr("NoScriptProvided");
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
