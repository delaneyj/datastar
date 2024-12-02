// Authors: Delaney Gillilan
// Icon: streamline:interface-edit-view-eye-eyeball-open-view
// Slug: Show or hide an element
// Description: This attribute shows or hides an element based on the value of the expression. If the expression is true, the element is shown. If the expression is false, the element is hidden. The element is hidden by setting the display property to none.

import { AttributePlugin, PluginType } from "../../../../engine/types";

const NONE = "none";
const DISPLAY = "display";

export const Show: AttributePlugin = {
    type: PluginType.Attribute,
    name: "show",
    onLoad: ({ el: { style: s }, key, value, rx, effect }) => {
        if (key.length) throw new Error("No key allowed");
        if (!value.length) throw new Error("No value provided");
        return effect(async () => {
            const shouldShow = rx<boolean>();
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
