// Authors: Delaney Gillilan
// Icon: ic:baseline-format-paint
// Slug: Add or remove classes from an element reactively
// Description: This action adds or removes classes from an element reactively based on the expression provided. The expression should be an object where the keys are the class names and the values are booleans. If the value is true, the class is added. If the value is false, the class is removed.

import { AttributePlugin } from "../../../../engine";

export const Class: AttributePlugin = {
    pluginType: "attribute",
    name: "class",
    mustHaveEmptyKey: true,
    mustNotEmptyExpression: true,

    onLoad: (ctx) => {
        return ctx.reactivity.effect(() => {
            const classes: Object = ctx.expressionFn(ctx);
            for (const [k, v] of Object.entries(classes)) {
                const classNames = k.split(" ");
                if (v) {
                    ctx.el.classList.add(...classNames);
                } else {
                    ctx.el.classList.remove(...classNames);
                }
            }
        });
    },
};
