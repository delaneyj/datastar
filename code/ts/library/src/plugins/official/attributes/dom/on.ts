// Authors: Delaney Gillilan
// Icon: material-symbols:mail
// Slug: Add an event listener to an element
// Description: This action adds an event listener to an element. The event listener can be triggered by a variety of events, such as clicks, keypresses, and more. The event listener can also be set to trigger only once, or to be passive or capture. The event listener can also be debounced or throttled. The event listener can also be set to trigger only when the event target is outside the element.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { argsHas, argsToMs } from "../../../../utils/arguments";
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

let lastSignalsMarshalled = "";

// Sets the event listener of the element
export const On: AttributePlugin = {
  type: PluginType.Attribute,
  name: "on",
  mustKey: true,
  mustValue: true,
  argNames: ["evt"],
  onLoad: (ctx) => {
    const { el, key, expr } = ctx;

    let target: Element | Window | Document = ctx.el;
    if (ctx.mods.get("window")) {
      target = window;
    }

    let callback = (evt?: Event) => {
      expr(ctx, evt);
    };

    const debounceArgs = ctx.mods.get("debounce");
    if (debounceArgs) {
      const wait = argsToMs(debounceArgs);
      const leading = argsHas(debounceArgs, "leading", false);
      const trailing = argsHas(debounceArgs, "noTrail", true);
      callback = debounce(callback, wait, leading, trailing);
    }

    const throttleArgs = ctx.mods.get("throttle");
    if (throttleArgs) {
      const wait = argsToMs(throttleArgs);
      const leading = argsHas(throttleArgs, "noLead", true);
      const trailing = argsHas(throttleArgs, "noTrail", false);
      callback = throttle(callback, wait, leading, trailing);
    }

    const evtListOpts: AddEventListenerOptions = {
      capture: true,
      passive: false,
      once: false,
    };
    if (!ctx.mods.has("capture")) evtListOpts.capture = false;
    if (ctx.mods.has("passive")) evtListOpts.passive = true;
    if (ctx.mods.has("once")) evtListOpts.once = true;

    const unknownModifierKeys = [...ctx.mods.keys()].filter(
      (key) => !knownOnModifiers.has(key)
    );

    unknownModifierKeys.forEach((attrName) => {
      const eventValues = ctx.mods.get(attrName) || [];
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
          const expr = eventValues.join("").toLowerCase().trim();
          valid = lowerAttr === expr;
        } else {
          // console.error(`Invalid value for ${attrName} modifier on ${key} on ${el}`);
          throw ERR_BAD_ARGS;
        }

        if (valid) {
          cb(evt);
        }
      };
      callback = revisedCallback;
    });

    const eventName = kebabize(key).toLowerCase();
    switch (eventName) {
      case "load":
        callback();
        delete ctx.el.dataset.onLoad;
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
        return ctx.reactivity.effect(() => {
          const onlyRemoteSignals = ctx.mods.has("remote");
          const current = ctx.signals.JSON(false, onlyRemoteSignals);
          if (lastSignalsMarshalled !== current) {
            lastSignalsMarshalled = current;
            callback();
          }
        });

      default:
        const testOutside = ctx.mods.has("outside");
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
          // console.log(`Removing event listener for ${eventName} on ${el}`)
          target.removeEventListener(eventName, callback);
        };
    }
  },
};
