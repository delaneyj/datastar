// Authors: Delaney Gillilan
// Icon: tabler:typography
// Slug: Set the text content of an element
// Description: This attribute sets the text content of an element to the result of the expression.

import { AttributePlugin } from "../../../../engine";
import { ERR_BAD_ARGS } from "../../../../engine/errors";

export const Text: AttributePlugin = {
    pluginType: "attribute",
    name: "text",
    mustHaveEmptyKey: true,
    onLoad: (ctx) => {
        const { el, expressionFn } = ctx;
        if (!(el instanceof HTMLElement)) {
            // Element is not HTMLElement
            throw ERR_BAD_ARGS;
        }
        return ctx.reactivity.effect(() => {
            const res = expressionFn(ctx);
            el.textContent = `${res}`;
        });
    },
};
