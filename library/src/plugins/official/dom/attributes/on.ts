// Authors: Delaney Gillilan
// Icon: material-symbols:mail
// Slug: Add an event listener to an element
// Description: This action adds an event listener to an element. The event listener can be triggered by a variety of events, such as clicks, keypresses, and more. The event listener can also be set to trigger only once, or to be passive or capture. The event listener can also be debounced or throttled. The event listener can also be set to trigger only when the event target is outside the element.

import {
    AttributePlugin,
    PluginType,
    Requirement,
} from "../../../../engine/types";
import { modifiers } from "../../../../utils/modifiers";
import { kebabize } from "../../../../utils/text";
import { debounce, throttle } from "../../../../utils/timing";

let lastSignalsMarshalled = "";
const EVT = "evt";
export const On: AttributePlugin = {
    type: PluginType.Attribute,
    name: "on",
    keyReq: Requirement.Must,
    valReq: Requirement.Must,
    argNames: [EVT],
    macros: {
        pre: [
            {
                // We need to escape the evt in case .value is used
                type: PluginType.Macro,
                name: "evtEsc",
                fn: (original) => {
                    return original.replaceAll(
                        /evt.([\w\.]+)value/gm,
                        "EVT_$1_VALUE",
                    );
                },
            },
        ],
        post: [
            {
                // We need to unescape the evt in case .value is used
                type: PluginType.Macro,
                name: "evtUnesc",
                fn: (original) => {
                    return original.replaceAll(
                        /EVT_([\w\.]+)_VALUE/gm,
                        "evt.$1value",
                    );
                },
            },
        ],
    },
    onLoad: (ctx) => {
        const { el, key, genRX, signals, effect } = ctx;
        const rx = genRX();

        let target: Element | Window | Document = el;

        const mods = modifiers(ctx);
        if (mods?.window ?? false) target = window;

        let callback = (evt?: Event) => {
            if (mods?.preventDefault ?? false) {
                evt?.preventDefault();
            }
            rx(evt);
        };

        if ("debounce" in mods) {
            const time = mods?.debounce?.time || 100;
            const leading = mods?.debounce?.leading ?? false;
            const noTrail = mods?.debounce?.noTrail ?? false;
            callback = debounce(callback, time, leading, !noTrail);
        }

        if ("throttle" in mods) {
            const time = mods?.throttle?.time ?? 100;
            const noLead = mods?.throttle?.noLead ?? false;
            const trailing = mods?.throttle?.noTrail ?? false;
            callback = throttle(callback, time, !noLead, trailing);
        }

        const evtListOpts: AddEventListenerOptions = {
            capture: mods?.capture ?? true,
            passive: mods?.passive ?? false,
            once: mods?.once ?? false,
        };

        const eventName = kebabize(key).toLowerCase();
        switch (eventName) {
            case "load":
                callback();
                delete el.dataset.onLoad;
                return () => {};

            case "raf":
                let rafId: number | undefined;
                const raf = () => {
                    callback();
                    rafId = requestAnimationFrame(raf);
                };
                rafId = requestAnimationFrame(raf);

                return () => {
                    if (rafId) cancelAnimationFrame(rafId);
                };

            case "signals-change":
                return effect(() => {
                    const onlyRemoteSignals = mods?.onlyremote ?? false;
                    const current = signals.JSON(false, onlyRemoteSignals);
                    if (current !== lastSignalsMarshalled) {
                        lastSignalsMarshalled = current;
                        callback();
                    }
                });
            default:
                const testOutside = mods?.outside ?? false;
                if (testOutside) {
                    target = document;
                    const cb = callback;
                    let called = false;
                    const targetOutsideCallback = (e?: Event) => {
                        const targetHTML = e?.target as HTMLElement;
                        if (!targetHTML) return;
                        const isEl = el.id === targetHTML.id;
                        if (isEl && called) {
                            called = false;
                        }
                        if (!isEl && !called) {
                            cb(e);
                            called = true;
                        }
                    };
                    callback = targetOutsideCallback;
                }

                target.addEventListener(eventName, callback, evtListOpts);
                return () => {
                    target.removeEventListener(eventName, callback);
                };
        }
    },
};
