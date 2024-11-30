// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const SetAll: ActionPlugin = {
    type: PluginType.Action,
    name: "setAll",
    method: (ctx, regexp, newValue) => {
        const re = new RegExp(regexp);
        ctx.signals.walk((name, signal) =>
            re.test(name) && (signal.value = newValue)
        );
    },
};
