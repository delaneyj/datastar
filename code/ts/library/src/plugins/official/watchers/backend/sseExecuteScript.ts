// Authors: Delaney Gillilan
// Icon: tabler:file-type-js
// Slug: Execute JavaScript from a Server-Sent Event
// Description: Execute JavaScript from a Server-Sent Event

import { WatcherPlugin } from "../../../../engine/types";

import {
    DefaultExecuteScriptAttributes,
    DefaultExecuteScriptAutoRemove,
    EventTypes,
} from "../../../../engine/consts";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { isBoolString } from "../../../../utils/text";
import { datastarSSEEventWatcher } from "./sseShared";

export const ExecuteScript: WatcherPlugin = {
    pluginType: "watcher",
    name: EventTypes.ExecuteScript,
    onGlobalInit: async () => {
        datastarSSEEventWatcher(
            EventTypes.ExecuteScript,
            (
                {
                    autoRemove: autoRemoveRaw =
                        `${DefaultExecuteScriptAutoRemove}`,
                    attributes: attributesRaw = DefaultExecuteScriptAttributes,
                    script,
                },
            ) => {
                const autoRemove = isBoolString(autoRemoveRaw);
                if (!script?.length) {
                    // No script provided
                    throw ERR_BAD_ARGS;
                }
                const scriptEl = document.createElement("script");
                attributesRaw.split("\n").forEach((attr) => {
                    const pivot = attr.indexOf(" ");
                    const key = attr.slice(0, pivot).trim();
                    const value = attr.slice(pivot).trim();
                    scriptEl.setAttribute(key, value);
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
