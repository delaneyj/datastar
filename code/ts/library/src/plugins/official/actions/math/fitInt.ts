// Authors: Delaney Gillilan
// Icon: material-symbols:fit-width
// Slug: Linearly fit a value to a new range and round to the nearest integer
// Description: This action linearly fits a value to a new range. The value is first scaled to the new range.  Note it is not clamped to the new range.

import { ActionPlugin, AttributeContext } from "../../../../engine";

export const FitInt: ActionPlugin = {
    pluginType: "action",
    name: "fitInt",
    method: (
        _: AttributeContext,
        v: number,
        oldMin: number,
        oldMax: number,
        newMin: number,
        newMax: number,
    ) => {
        return Math.round(
            ((v - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin,
        );
    },
};
