// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { AttributePlugin } from "../../../../engine";
import { DATASTAR, DATASTAR_EVENT } from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { DatastarSSEEvent } from "../../watchers/backend/sseShared";

const SESSION = "session";
const LOCAL = "local";
const REMOTE = "remote";

export const Persist: AttributePlugin = {
  type: PluginType.Attribute,
  name: "persist",
  onlyMods: new Set([LOCAL, SESSION, REMOTE]),
  onLoad: (ctx) => {
    const { signals, expr } = ctx;
    const key = ctx.key || DATASTAR;
    const expression = ctx.value;
    const keys = new Set<string>();

    if (expression.trim() !== "") {
      const value = expr(ctx);
      const parts = value.split(" ");
      for (const part of parts) {
        keys.add(part);
      }
    }

    let lastMarshalled = "";
    const storageType = ctx.mods.has(SESSION) ? SESSION : LOCAL;
    const useRemote = ctx.mods.has(REMOTE);

    const signalsUpdateHandler = ((_: CustomEvent<DatastarSSEEvent>) => {
      const marshalled = signals.subset(...keys).JSON(false, useRemote);

      if (marshalled === lastMarshalled) {
        return;
      }

      if (storageType === SESSION) {
        window.sessionStorage.setItem(key, marshalled);
      } else {
        window.localStorage.setItem(key, marshalled);
      }

      lastMarshalled = marshalled;
    }) as EventListener;

    window.addEventListener(DATASTAR_EVENT, signalsUpdateHandler);

    let marshalledSignals: string | null;

    if (storageType === SESSION) {
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
