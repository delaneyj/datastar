// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { AttributePlugin } from "../../../../engine";
import { DATASTAR, DATASTAR_EVENT } from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { remoteSignals } from "../../../../utils/signals";
import { DatastarSSEEvent } from "../../watchers/backend/sseShared";

export const Persist: AttributePlugin = {
  pluginType: PluginType.Attribute,
  name: "persist",
  allowedModifiers: new Set(["local", "session", "remote"]),
  onLoad: (ctx) => {
    const key = ctx.key || DATASTAR;
    const expression = ctx.expression;
    const keys = new Set<string>();

    if (expression.trim() !== "") {
      const value = ctx.expressionFn(ctx);
      const parts = value.split(" ");
      for (const part of parts) {
        keys.add(part);
      }
    }

    let lastMarshalled = "";
    const storageType = ctx.modifiers.has("session") ? "session" : "local";
    const useRemote = ctx.modifiers.has("remote");

    const signalsUpdateHandler = ((_: CustomEvent<DatastarSSEEvent>) => {
      let signals = ctx.signals;
      if (useRemote) {
        signals = remoteSignals(signals);
      }
      if (keys.size > 0) {
        const newSignals: Record<string, any> = {};
        for (const key of keys) {
          const parts = key.split(".");
          let newSubSignals = newSignals;
          let subSignals = signals;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!newSubSignals[part]) {
              newSubSignals[part] = {};
            }
            newSubSignals = newSubSignals[part];
            subSignals = subSignals[part];
          }

          const lastPart = parts[parts.length - 1];
          newSubSignals[lastPart] = subSignals[lastPart];
        }
        signals = newSignals;
      }

      const marshalledSignals = JSON.stringify(signals);

      if (marshalledSignals === lastMarshalled) {
        return;
      }

      if (storageType === "session") {
        window.sessionStorage.setItem(key, marshalledSignals);
      } else {
        window.localStorage.setItem(key, marshalledSignals);
      }

      lastMarshalled = marshalledSignals;
    }) as EventListener;

    window.addEventListener(DATASTAR_EVENT, signalsUpdateHandler);

    let marshalledSignals: string | null;

    if (storageType === "session") {
      marshalledSignals = window.sessionStorage.getItem(key);
    } else {
      marshalledSignals = window.localStorage.getItem(key);
    }

    if (!!marshalledSignals) {
      const signals = JSON.parse(marshalledSignals);
      for (const key in signals) {
        ctx.upsertSignal(key, signals[key]);
      }
    }

    return () => {
      window.removeEventListener(DATASTAR_EVENT, signalsUpdateHandler);
    };
  },
};
