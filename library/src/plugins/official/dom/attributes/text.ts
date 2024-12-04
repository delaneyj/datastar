// Authors: Delaney Gillilan
// Icon: tabler:typography
// Slug: Set the text content of an element
// Description: This attribute sets the text content of an element to the result of the expression.

import { dsErr } from "../../../../engine/errors";
import { AttributePlugin, KeyValRules, PluginType } from "../../../../engine/types";

export const Text: AttributePlugin = {
    type: PluginType.Attribute,
    name: "text",
    keyValRule: KeyValRules.KeyNotAllowed_ValueRequired,
    onLoad: (ctx) => {
        const { el, genRX, effect } = ctx;
        const rx = genRX();
        if (!(el instanceof HTMLElement)) {
            dsErr("NotHtmlElement");
        }
        return effect(() => {
            const res = rx(ctx);
            el.textContent = `${res}`;
        });
    },
};
