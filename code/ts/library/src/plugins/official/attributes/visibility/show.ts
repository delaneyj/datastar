// Authors: Delaney Gillilan
// Icon: streamline:interface-edit-view-eye-eyeball-open-view
// Slug: Show or hide an element
// Description: This attribute shows or hides an element based on the value of the expression. If the expression is true, the element is shown. If the expression is false, the element is hidden. The element is hidden by setting the display property to none.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

const NONE = "none";
const DISPLAY = "display";

export const Show: AttributePlugin = {
    pluginType: PluginType.Attribute,
    name: "show",
    mustHaveEmptyKey: true,
    mustNotEmptyExpression: true,

    onLoad: (ctx) => {
        const { expressionFn, el: { style: s }, reactivity: { effect } } = ctx;
        return effect(async () => {
            const shouldShow: boolean = expressionFn(ctx);
            if (shouldShow) {
                if (s.display === NONE) {
                    s.removeProperty(DISPLAY);
                }
            } else {
                s.setProperty(DISPLAY, NONE);
            }
        });
    },
};
