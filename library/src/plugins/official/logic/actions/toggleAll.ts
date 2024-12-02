// Authors: Delaney Gillilan
// Icon: material-symbols:toggle-off
// Slug: Toggle all signals that match a regular expression

import { ActionPlugin, PluginType } from "../../../../engine/types";

export const ToggleAll: ActionPlugin = {
    type: PluginType.Action,
    name: "toggleAll",
    fn: (ctx, regexp) => {
        const re = new RegExp(regexp);
        ctx.signals.walk(
            (name, signal) => re.test(name) && (signal.value = !signal.value),
        );
    },
};
