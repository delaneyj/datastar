// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin, PluginType } from "../../../../engine/types";

export const SetAll: ActionPlugin = {
    type: PluginType.Action,
    name: "setAll",
    fn: ({ signals }, prefix: string, newValue) => {
        signals.walk((path, signal) => {
            if (!path.startsWith(prefix)) return;
            signal.value = newValue;
        });
    },
};
