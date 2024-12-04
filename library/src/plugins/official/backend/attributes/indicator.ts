// Icon: material-symbols:network-wifi
// Slug: Sets the indicator signal used when fetching data via SSE
// Description: must be a valid signal name

import { DATASTAR } from "../../../../engine/consts";
import { dsErr } from "../../../../engine/errors";
import { AttributePlugin, PluginType } from "../../../../engine/types";
import {
    DATASTAR_SSE_EVENT,
    DatastarSSEEvent,
    FINISHED,
    STARTED,
} from "../shared";

export const INDICATOR_CLASS = `${DATASTAR}-indicator`;
export const INDICATOR_LOADING_CLASS = `${INDICATOR_CLASS}-loading`;

export const Indicator: AttributePlugin = {
    type: PluginType.Attribute,
    name: "indicator",
    onLoad: ({ value, signals, el, key }) => {
        if (key.length) {
            throw dsErr("IndicatorKeyNotAllowed");
        }
        if (!value.length) {
            throw dsErr("IndicatorValueNotProvided");
        }

        const signal = signals.upsert(value, false);
        const watcher = (event: CustomEvent<DatastarSSEEvent>) => {
            const {
                type,
                argsRaw: { elId },
            } = event.detail;
            if (elId !== el.id) return;
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
