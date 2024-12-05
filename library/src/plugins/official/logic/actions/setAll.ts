// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin, PluginType } from "../../../../engine/types";

export const SetAll: ActionPlugin = {
    type: PluginType.Action,
    name: "setAll",
    fn: (ctx, regexp, newValue) => {
        const re = new RegExp(regexp);
        ctx.signals.walk(
            (name, signal) => re.test(name) && (signal.value = newValue),
        );
    },
};
