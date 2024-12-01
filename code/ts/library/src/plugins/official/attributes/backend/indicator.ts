// Authors: Delaney Gillilan
// Icon: material-symbols:network-wifi
// Slug: Sets the indicator signal used when fetching data via SSE
// Description: must be a valid signal name

import { AttributePlugin } from "../../../../engine";
import { DATASTAR } from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import {
  DATASTAR_SSE_EVENT,
  DatastarSSEEvent,
  FINISHED,
  STARTED,
} from "../../watchers/backend/sseShared";

export const INDICATOR_CLASS = `${DATASTAR}-indicator`;
export const INDICATOR_LOADING_CLASS = `${INDICATOR_CLASS}-loading`;

export const Indicator: AttributePlugin = {
  type: PluginType.Attribute,
  name: "indicator",
  noKey: true,
  onLoad: (ctx) => {
    const { value, signals, el } = ctx;
    const signal = signals.upsert(value, false);

    const watcher = (event: CustomEvent<DatastarSSEEvent>) => {
      const {
        type,
        argsRaw: { elID },
      } = event.detail;
      if (elID !== el.id) return;
      switch (type) {
        case STARTED:
          signal.value = true;
          break;
        case FINISHED:
          signal.value = false;
          break;
      }
    };

    document.addEventListener(DATASTAR_SSE_EVENT, watcher);

    return () => {
      document.removeEventListener(DATASTAR_SSE_EVENT, watcher);
    };
  },
};
