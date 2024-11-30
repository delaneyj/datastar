// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { AttributePlugin } from "../../../../engine";
import { DATASTAR, DATASTAR_EVENT } from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { DatastarSSEEvent } from "../../watchers/backend/sseShared";

export const Persist: AttributePlugin = {
  pluginType: PluginType.Attribute,
  name: "persist",
  allowedModifiers: new Set(["local", "session", "remote"]),
  onLoad: (ctx) => {
    const { signals, expressionFn } = ctx;
    const key = ctx.key || DATASTAR;
    const expression = ctx.expression;
    const keys = new Set<string>();

    if (expression.trim() !== "") {
      const value = expressionFn(ctx);
      const parts = value.split(" ");
      for (const part of parts) {
        keys.add(part);
      }
    }

    let lastMarshalled = "";
    const storageType = ctx.modifiers.has("session") ? "session" : "local";
    const useRemote = ctx.modifiers.has("remote");

    const signalsUpdateHandler = ((_: CustomEvent<DatastarSSEEvent>) => {
      const marshalled = signals.subset(...keys).JSON(false, useRemote);

      if (marshalled === lastMarshalled) {
        return;
      }

      if (storageType === "session") {
        window.sessionStorage.setItem(key, marshalled);
      } else {
        window.localStorage.setItem(key, marshalled);
      }

      lastMarshalled = marshalled;
    }) as EventListener;

    window.addEventListener(DATASTAR_EVENT, signalsUpdateHandler);

    let marshalledSignals: string | null;

    if (storageType === "session") {
      marshalledSignals = window.sessionStorage.getItem(key);
    } else {
      marshalledSignals = window.localStorage.getItem(key);
    }

    if (!!marshalledSignals) {
      const unmarshalledSignals = JSON.parse(marshalledSignals);
      signals.merge(unmarshalledSignals, true);
    }

    return () => {
      window.removeEventListener(DATASTAR_EVENT, signalsUpdateHandler);
    };
  },
};
