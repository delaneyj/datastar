// Authors: Delaney Gillilan
// Icon: material-symbols:fit-screen
// Slug: Clamp a value to a new range and round to the nearest integer
// Description: This action clamps a value to a new range. The value is first scaled to the new range, then clamped to the new range. This is useful for scaling a value to a new range, then clamping it to that range. The result is then rounded to the nearest integer.

import { ActionPlugin, AttributeContext } from "../../../../engine";

export const ClampFitInt: ActionPlugin = {
    pluginType: "action",
    name: "clampFitInt",
    method: (
        _: AttributeContext,
        v: number,
        oldMin: number,
        oldMax: number,
        newMin: number,
        newMax: number,
    ) => {
        return Math.round(
            Math.max(
                newMin,
                Math.min(
                    newMax,
                    ((v - oldMin) / (oldMax - oldMin)) * (newMax - newMin) +
                        newMin,
                ),
            ),
        );
    },
};
