// Authors: Delaney Gillilan
// Icon: mdi-light:vector-intersection
// Slug: Run expression when element intersects with viewport
// Description: An attribute that runs an expression when the element intersects with the viewport.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

const ONCE = "once";
const HALF = "half";
const FULL = "full";

// Run expression when element intersects with viewport
export const Intersection: AttributePlugin = {
  type: PluginType.Attribute,
  name: "intersects",
  onlyMods: new Set([ONCE, HALF, FULL]),
  noKey: true,
  onLoad: (ctx) => {
    const { mods } = ctx;
    const options = { threshold: 0 };
    if (mods.has(FULL)) options.threshold = 1;
    else if (mods.has(HALF)) options.threshold = 0.5;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ctx.expr(ctx);
          if (mods.has(ONCE)) {
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
