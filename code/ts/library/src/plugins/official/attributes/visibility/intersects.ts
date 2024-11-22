// Authors: Delaney Gillilan
// Icon: mdi-light:vector-intersection
// Slug: Run expression when element intersects with viewport
// Description: An attribute that runs an expression when the element intersects with the viewport.

import { AttributePlugin } from "../../../../engine";

const ONCE = "once";
const HALF = "half";
const FULL = "full";

// Run expression when element intersects with viewport
export const Intersection: AttributePlugin = {
    pluginType: "attribute",
    name: "intersects",
    allowedModifiers: new Set([ONCE, HALF, FULL]),
    mustHaveEmptyKey: true,
    onLoad: (ctx) => {
        const { modifiers } = ctx;
        const options = { threshold: 0 };
        if (modifiers.has(FULL)) options.threshold = 1;
        else if (modifiers.has(HALF)) options.threshold = 0.5;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    ctx.expressionFn(ctx);
                    if (modifiers.has(ONCE)) {
                        observer.disconnect();
                        delete ctx.el.dataset[ctx.rawKey];
                    }
                }
            });
        }, options);

        observer.observe(ctx.el);
        return () => observer.disconnect();
    },
};
