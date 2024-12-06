// Authors: Delaney Gillilan
// Icon: material-symbols:toggle-off
// Slug: Toggle all signals that match a regular expression

import { ActionPlugin, PluginType } from "../../../../engine/types";

export const ToggleAll: ActionPlugin = {
    type: PluginType.Action,
    name: "toggleAll",
    fn: (ctx, path: string) => {
        ctx.signals.walk(
            (name, signal) => {
                if (!name.startsWith(path)) return;
                signal.value = !signal.value;
            },
        );
    },
};
