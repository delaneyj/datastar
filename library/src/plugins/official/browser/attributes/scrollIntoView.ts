// Authors: Delaney Gillilan
// Icon: hugeicons:mouse-scroll-01
// Slug: Scroll an element into view
// Description: This attribute scrolls the element into view.

import { dsErr } from "../../../../engine/errors";
import {
    AttributePlugin,
    PluginType,
    Requirement,
} from "../../../../engine/types";
import { modifiers } from "../../../../utils/modifiers";

const SMOOTH = "smooth";
const CENTER = "center";

// Scrolls the element into view
export const ScrollIntoView: AttributePlugin = {
    type: PluginType.Attribute,
    name: "scrollIntoView",
    keyReq: Requirement.Denied,
    valReq: Requirement.Denied,
    onLoad: (ctx) => {
        const { el, rawKey } = ctx;
        if (!el.tabIndex) el.setAttribute("tabindex", "0");
        const mods = modifiers(ctx);
        const opts: ScrollIntoViewOptions = {
            behavior: mods?.behavior ?? SMOOTH,
            block: mods?.block ?? CENTER,
            inline: mods?.inline ?? CENTER,
        };

        if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
            throw dsErr("NotHtmlSvgElement", { el });
        }
        if (!el.tabIndex) {
            el.setAttribute("tabindex", "0");
        }

        el.scrollIntoView(opts);
        if ("focus" in mods) {
            el.focus();
        }

        delete el.dataset[rawKey];
        return () => {};
    },
};
