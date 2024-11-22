// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin } from "../../../../engine";

export const SetAll: ActionPlugin = {
    pluginType: "action",
    name: "setAll",
    method: (ctx, regexp, newValue) => {
        const re = new RegExp(regexp);
        ctx.walkSignals((name, signal) =>
            re.test(name) && (signal.value = newValue)
        );
    },
};
