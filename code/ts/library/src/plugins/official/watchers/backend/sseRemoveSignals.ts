// Authors: Delaney Gillilan
// Icon: material-symbols:settings-input-antenna
// Slug: Merge fine grain signals store data from a server using the Datastar SDK interface
// Description: Merge store data from a server using the Datastar SDK interface

import { EventTypes } from "../../../../engine/consts";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { WatcherPlugin } from "../../../../engine/types";
import { datastarSSEEventWatcher } from "./sseShared";

export const RemoveSignals: WatcherPlugin = {
    pluginType: "watcher",
    name: EventTypes.RemoveSignals,
    onGlobalInit: async (ctx) => {
        datastarSSEEventWatcher(
            EventTypes.RemoveSignals,
            ({ paths: pathsRaw = "" }) => {
                const paths = pathsRaw.split("\n").map((p) => p.trim());
                if (!!!paths?.length) {
                    // No paths provided for remove-signals
                    throw ERR_BAD_ARGS;
                }
                ctx.removeSignals(...paths);
            },
        );
    },
};
