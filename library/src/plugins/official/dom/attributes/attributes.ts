// Authors: Delaney Gillilan
// Icon: akar-icons:link-chain
// Slug: Bind attributes to expressions
// Description: Any attribute can be bound to an expression. The attribute will be updated reactively whenever the expression signal changes.

import { AttributePlugin, PluginType } from "../../../../engine/types";
import { kebabize } from "../../../../utils/text";

export const Attributes: AttributePlugin = {
    type: PluginType.Attribute,
    name: "attributes",
    onLoad: ({ el, genRX, key, effect, signals }) => {
        const rx = genRX();

        if (key === "") {
            const binds = rx<Record<string, string>>();

            Object.keys(binds).forEach((key) => signals.upsert(key, ""));

            return effect(async () => {
                for (const [attr, path] of Object.entries(binds)) {
                    const val = signals.signal(path)!.value;
                    el.setAttribute(attr, val);
                }
            });
        } else {
            key = kebabize(key);
            return effect(async () => {
                const value = rx();
                let v: string;
                if (typeof value === "string") {
                    v = value;
                } else {
                    v = JSON.stringify(value);
                }
                if (!v || v === "false" || v === "null" || v === "undefined") {
                    el.removeAttribute(key);
                } else {
                    el.setAttribute(key, v);
                }
            });
        }
    },
};
