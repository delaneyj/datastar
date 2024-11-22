// Authors: Delaney Gillilan
// Icon: hugeicons:mouse-scroll-01
// Slug: Scroll an element into view
// Description: This attribute scrolls the element into view.

import { AttributeContext, AttributePlugin } from "../../../../engine";
import { scrollIntoView } from "../../../../utils/dom";

const SMOOTH = "smooth";
const INSTANT = "instant";
const AUTO = "auto";
const HSTART = "hstart";
const HCENTER = "hcenter";
const HEND = "hend";
const HNEAREST = "hnearest";
const VSTART = "vstart";
const VCENTER = "vcenter";
const VEND = "vend";
const VNEAREST = "vnearest";
const FOCUS = "focus";

const CENTER = "center";
const START = "start";
const END = "end";
const NEAREST = "nearest";

// Scrolls the element into view
export const ScrollIntoView: AttributePlugin = {
    pluginType: "attribute",
    name: "scrollIntoView",
    mustHaveEmptyKey: true,
    mustHaveEmptyExpression: true,
    allowedModifiers: new Set([
        SMOOTH,
        INSTANT,
        AUTO,
        HSTART,
        HCENTER,
        HEND,
        HNEAREST,
        VSTART,
        VCENTER,
        VEND,
        VNEAREST,
        FOCUS,
    ]),

    onLoad: ({ el, modifiers, rawKey }: AttributeContext) => {
        if (!el.tabIndex) el.setAttribute("tabindex", "0");
        const opts: ScrollIntoViewOptions = {
            behavior: SMOOTH,
            block: CENTER,
            inline: CENTER,
        };
        if (modifiers.has(SMOOTH)) opts.behavior = SMOOTH;
        if (modifiers.has(INSTANT)) opts.behavior = INSTANT;
        if (modifiers.has(AUTO)) opts.behavior = AUTO;
        if (modifiers.has(HSTART)) opts.inline = START;
        if (modifiers.has(HCENTER)) opts.inline = CENTER;
        if (modifiers.has(HEND)) opts.inline = END;
        if (modifiers.has(HNEAREST)) opts.inline = NEAREST;
        if (modifiers.has(VSTART)) opts.block = START;
        if (modifiers.has(VCENTER)) opts.block = CENTER;
        if (modifiers.has(VEND)) opts.block = END;
        if (modifiers.has(VNEAREST)) opts.block = NEAREST;

        scrollIntoView(el, opts, modifiers.has("focus"));
        delete el.dataset[rawKey];
        return () => {};
    },
};
