import { ERR_BAD_ARGS, ERR_NOT_FOUND } from "../engine/errors";
import { HTMLorSVGElement } from "./types";

export function elemToSelector(
    elm: Element | Window | Document | string | null,
) {
    if (!elm) return "null";
    if (typeof elm === "string") return elm;
    if (elm instanceof Window) return "Window";
    if (elm instanceof Document) return "Document";

    if (elm.tagName === "BODY") return "BODY";
    const names = new Array<string>();
    while (elm.parentElement && elm.tagName !== "BODY") {
        if (elm.id) {
            const idAttr = elm.getAttribute("id");
            if (!idAttr) {
                // Element has an ID but no ID attribute
                throw ERR_BAD_ARGS;
            }
            names.unshift("#" + idAttr); // getAttribute, because `elm.id` could also return a child element with name "id"
            break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
        } else {
            let c = 1,
                e = elm;
            for (; e.previousElementSibling; e = e.previousElementSibling, c++);
            names.unshift(elm.tagName + ":nth-child(" + c + ")");
        }
        elm = elm.parentElement;
    }
    return names.join(">");
}

export function nodeHTMLorSVGElement(node: Node): HTMLorSVGElement | null {
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
        return null;
    }
    return node;
}

export function scrollIntoView(
    el: HTMLElement | SVGElement,
    opts: ScrollIntoViewOptions,
    shouldFocus = true,
) {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
        // Element is not an HTMLElement or SVGElement
        throw ERR_NOT_FOUND;
    }
    if (!el.tabIndex) el.setAttribute("tabindex", "0");

    el.scrollIntoView(opts);
    if (shouldFocus) el.focus();
}
