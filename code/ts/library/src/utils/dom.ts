import { DATASTAR } from "../engine/consts";
import { ERR_NOT_FOUND } from "../engine/errors";

export function consistentUniqID(el: Element) {
    if (el.id) return el.id;
    let hash = 0;
    const hashUpdate = (n: number) => {
        hash = ((hash << 5) - hash) + n;
        return hash & hash;
    };
    const hashUpdateFromStr = (str: string) =>
        str.split("").forEach((c) => hashUpdate(c.charCodeAt(0)));

    while (el.parentNode) {
        if (el.id) {
            hashUpdateFromStr(`${el.id}`);
            break;
        } else {
            if (el === el.ownerDocument.documentElement) {
                hashUpdateFromStr(el.tagName);
            } else {
                for (
                    let i = 1, e = el;
                    e.previousElementSibling;
                    e = e.previousElementSibling, i++
                ) {
                    hashUpdate(i);
                }
                el = el.parentNode as Element;
            }
        }
        el = el.parentNode as Element;
    }
    return DATASTAR + hash;
}

export function scrollIntoView(
    el: HTMLElement | SVGElement,
    opts: ScrollIntoViewOptions,
    shouldFocus = true,
) {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
        // NON_HTML_SVG_EL – The `data-scroll-into-view` attribute was placed on an invalid element. It can only be placed on HTML and SVG elements.
        throw ERR_NOT_FOUND;
    }
    if (!el.tabIndex) el.setAttribute("tabindex", "0");

    el.scrollIntoView(opts);
    if (shouldFocus) el.focus();
}
