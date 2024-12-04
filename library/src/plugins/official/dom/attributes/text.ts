// Authors: Delaney Gillilan
// Icon: tabler:typography
// Slug: Set the text content of an element
// Description: This attribute sets the text content of an element to the result of the expression.

import { AttributePlugin, PluginType } from "../../../../engine/types";

export const Text: AttributePlugin = {
    type: PluginType.Attribute,
    name: "text",
    onLoad: (ctx) => {
        const { el, genRX, effect } = ctx;
        const rx = genRX();
        if (!(el instanceof HTMLElement)) {
            // dsErr("Element is not HTMLElement");
        }
        return effect(() => {
            console.log("Text attribute plugin");
            const res = rx(ctx);
            el.textContent = `${res}`;
        });
    },
};
