// Authors: Delaney Gillilan
// Icon: material-symbols:toggle-off
// Slug: Toggle all signals that match a regular expression

import { ActionPlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const ToggleAll: ActionPlugin = {
    pluginType: PluginType.Action,
    name: "toggleAll",
    method: (ctx, regexp) => {
        const re = new RegExp(regexp);
        ctx.walkSignals((name, signal) =>
            re.test(name) && (signal.value = !signal.value)
        );
    },
};
