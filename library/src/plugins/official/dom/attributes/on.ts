// Authors: Delaney Gillilan
// Icon: material-symbols:mail
// Slug: Add an event listener to an element
// Description: This action adds an event listener to an element. The event listener can be triggered by a variety of events, such as clicks, keypresses, and more. The event listener can also be set to trigger only once, or to be passive or capture. The event listener can also be debounced or throttled. The event listener can also be set to trigger only when the event target is outside the element.

import { dsErr } from "../../../../engine/errors";
import { AttributePlugin, PluginType } from "../../../../engine/types";
import { argsHas, argsMs } from "../../../../utils/arguments";
import { kebabize } from "../../../../utils/text";
import { debounce, throttle } from "../../../../utils/timing";

const knownOnModifiers = new Set([
    "window",
    "once",
    "passive",
    "capture",
    "debounce",
    "throttle",
    "remote",
    "outside",
]);

export const On: AttributePlugin = {
    type: PluginType.Attribute,
    name: "on",
    argNames: ["evt"],
    onLoad: ({ el, key, genRX, mods, signals, effect }) => {
        const rx = genRX();
        let target: Element | Window | Document = el;
        if (mods.has("window")) target = window;

        let callback = (evt?: Event) => {
            rx(evt);
        };

        const debounceArgs = mods.get("debounce");
        if (debounceArgs) {
            const wait = argsMs(debounceArgs);
            const leading = argsHas(debounceArgs, "leading", false);
            const trailing = !argsHas(debounceArgs, "noTrail", false);
            callback = debounce(callback, wait, leading, trailing);
        }

        const throttleArgs = mods.get("throttle");
        if (throttleArgs) {
            const wait = argsMs(throttleArgs);
            const leading = !argsHas(throttleArgs, "noLeading", false);
            const trailing = argsHas(throttleArgs, "trail", false);
            callback = throttle(callback, wait, leading, trailing);
        }

        const evtListOpts: AddEventListenerOptions = {
            capture: true,
            passive: false,
            once: false,
        };
        if (!mods.has("capture")) evtListOpts.capture = false;
        if (mods.has("passive")) evtListOpts.passive = true;
        if (mods.has("once")) evtListOpts.once = true;

        const unknownModifierKeys = [...mods.keys()].filter(
            (key) => !knownOnModifiers.has(key),
        );

        unknownModifierKeys.forEach((attrName) => {
            const eventValues = mods.get(attrName) || [];
            const cb = callback;
            const revisedCallback = () => {
                const evt = event as any;
                const attr = evt[attrName];
                let valid: boolean;

                if (typeof attr === "function") {
                    valid = attr(...eventValues);
                } else if (typeof attr === "boolean") {
                    valid = attr;
                } else if (typeof attr === "string") {
                    const lowerAttr = attr.toLowerCase().trim();
                    const expr = [...eventValues].join("").toLowerCase().trim();
                    valid = lowerAttr === expr;
                } else {
                    throw dsErr("InvalidValue", { attrName, key, el });
                }

                if (valid) {
                    cb(evt);
                }
            };
            callback = revisedCallback;
        });

        let lastSignalsMarshalled = "";
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
                    const onlyRemoteSignals = mods.has("remote");
                    const current = signals.JSON(false, onlyRemoteSignals);
                    if (lastSignalsMarshalled !== current) {
                        lastSignalsMarshalled = current;
                        callback();
                    }
                });

            default:
                const testOutside = mods.has("outside");
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
