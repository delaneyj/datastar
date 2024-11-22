// Authors: Delaney Gillilan
// Icon: streamline:interface-edit-view-eye-eyeball-open-view
// Slug: Show or hide an element
// Description: This attribute shows or hides an element based on the value of the expression. If the expression is true, the element is shown. If the expression is false, the element is hidden. The element is hidden by setting the display property to none.

import { AttributePlugin } from "../../../../engine";

export const Show: AttributePlugin = {
    pluginType: "attribute",
    name: "show",
    mustHaveEmptyKey: true,
    mustNotEmptyExpression: true,

    onLoad: (ctx) => {
        return ctx.reactivity.effect(async () => {
            const shouldShow: boolean = ctx.expressionFn(ctx);

            if (shouldShow) {
                if (ctx.el.style.display === "none") {
                    ctx.el.style.removeProperty("display");
                }
            } else {
                ctx.el.style.setProperty("display", "none");
            }
        });
    },
};
