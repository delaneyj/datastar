// Authors: Delaney Gillilan
// Icon: mdi-light:vector-intersection
// Slug: Run expression when element intersects with viewport
// Description: An attribute that runs an expression when the element intersects with the viewport.

import { AttributePlugin, PluginType } from "../../../../engine/types";

const ONCE = "once";
const HALF = "half";
const FULL = "full";

// Run expression when element intersects with viewport
export const Intersects: AttributePlugin = {
    type: PluginType.Attribute,
    name: "intersects",
    mods: new Set([ONCE, HALF, FULL]),
    onLoad: ({ el, key, rawKey, mods, genRX }) => {
        if (key.length) throw new Error("No key allowed");
        const options = { threshold: 0 };
        if (mods.has(FULL)) options.threshold = 1;
        else if (mods.has(HALF)) options.threshold = 0.5;

        const rx = genRX();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    rx();
                    if (mods.has(ONCE)) {
                        observer.disconnect();
                        delete el.dataset[rawKey];
                    }
                }
            });
        }, options);

        observer.observe(el);
        return () => observer.disconnect();
    },
};
