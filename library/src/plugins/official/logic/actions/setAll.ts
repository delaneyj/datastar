// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin, PluginType } from "../../../../engine/types";

export const SetAll: ActionPlugin = {
    type: PluginType.Action,
    name: "setAll",
    fn: ({ signals }, path: string, newValue) => {
        signals.walk((name, signal) => {
            if (!name.startsWith(path)) return;
            signal.value = newValue;
        });
    },
};
