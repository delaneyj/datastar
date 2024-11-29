// Authors: Delaney Gillilan
// Icon: fluent:draw-text-24-filled
// Slug: Create a computed signal
// Description: This attribute creates a computed signal that updates when its dependencies change.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const Computed: AttributePlugin = {
    pluginType: PluginType.Attribute,
    name: "computed",
    mustNotEmptyKey: true,
    onLoad: (ctx) => {
        const signals = ctx.signals();
        signals[ctx.key] = ctx.reactivity.computed(() => {
            return ctx.expressionFn(ctx);
        });

        return () => {
            const signals = ctx.signals();
            delete signals[ctx.key];
        };
    },
};
