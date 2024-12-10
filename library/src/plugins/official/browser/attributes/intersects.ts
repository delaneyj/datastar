// Authors: Delaney Gillilan
// Icon: mdi-light:vector-intersection
// Slug: Run expression when element intersects with viewport
// Description: An attribute that runs an expression when the element intersects with the viewport.

import {
    AttributePlugin,
    PluginType,
    Requirement,
} from "../../../../engine/types";
import { modifiers } from "../../../../utils/modifiers";

// Run expression when element intersects with viewport
export const Intersects: AttributePlugin = {
    type: PluginType.Attribute,
    name: "intersects",
    keyReq: Requirement.Denied,
    onLoad: (ctx) => {
        const { el, rawKey, genRX } = ctx;
        const mods = modifiers(ctx);
        const threshold = mods?.threshold ?? 0;
        const rx = genRX();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    rx();
                    if ("once" in mods) {
                        observer.disconnect();
                        delete el.dataset[rawKey];
                    }
                }
            });
        }, {
            threshold,
        });

        observer.observe(el);
        return () => observer.disconnect();
    },
};
