// Icon: material-symbols:settings-input-antenna
// Slug: Merge signals using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import {
    DefaultMergeSignalsOnlyIfMissing,
    EventTypes,
} from "../../../../engine/consts";
import { PluginType, WatcherPlugin } from "../../../../engine/types";
import { isBoolString } from "../../../../utils/text";
import { datastarSSEEventWatcher } from "../shared";

export const MergeSignals: WatcherPlugin = {
    type: PluginType.Watcher,
    name: EventTypes.MergeSignals,
    onGlobalInit: async (ctx) => {
        datastarSSEEventWatcher(
            EventTypes.MergeSignals,
            ({
                signals: raw = "{}",
                onlyIfMissing: onlyIfMissingRaw =
                    `${DefaultMergeSignalsOnlyIfMissing}`,
            }) => {
                const { signals } = ctx;
                const onlyIfMissing = isBoolString(onlyIfMissingRaw);
                const fn = new Function(`return Object.assign({}, ${raw})`);
                const possibleMergeSignals = fn();
                signals.merge(possibleMergeSignals, onlyIfMissing);
                ctx.apply(document.body);
            },
        );
    },
};
