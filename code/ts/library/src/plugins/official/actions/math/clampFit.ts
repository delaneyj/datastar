// Authors: Delaney Gillilan
// Icon: material-symbols:fit-screen-outline
// Slug: Clamp a value to a new range
// Description: This action clamps a value to a new range. The value is first scaled to the new range, then clamped to the new range. This is useful for scaling a value to a new range, then clamping it to that range.

import { ActionPlugin, AttributeContext } from "../../../../engine";

export const ClampFit: ActionPlugin = {
    pluginType: "action",
    name: "clampFit",
    method: (
        _: AttributeContext,
        v: number,
        oldMin: number,
        oldMax: number,
        newMin: number,
        newMax: number,
    ) => {
        return Math.max(
            newMin,
            Math.min(
                newMax,
                ((v - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin,
            ),
        );
    },
};
