// Authors: Delaney Gillilan
// Icon: material-symbols:network-wifi
// Slug: Sets the indicator signal used when fetching data via SSE
// Description: must be a valid signal name

import { AttributePlugin } from "../../../../engine";
import { DATASTAR } from "../../../../engine/consts";
import { ERR_NOT_FOUND } from "../../../../engine/errors";
import { isDatastarGeneratedID } from "../../../../utils/regex";
import {
    DATASTAR_SSE_EVENT,
    DatastarSSEEvent,
    FINISHED,
    STARTED,
} from "../../watchers/backend/sseShared";

export const INDICATOR_CLASS = `${DATASTAR}-indicator`;
export const INDICATOR_LOADING_CLASS = `${INDICATOR_CLASS}-loading`;

export const Indicator: AttributePlugin = {
    pluginType: "attribute",
    name: "indicator",
    mustHaveEmptyKey: true,
    onLoad: (ctx) => {
        const { expression, upsertSignal, el } = ctx;
        if (isDatastarGeneratedID(el)) {
            // Indicator cannot be used on an element without an ID
            // otherwise it will auto generate and most like will be incorrect
            // if you get to the point match sure this element has a unique ID.
            throw ERR_NOT_FOUND;
        }
        const signalName = expression;
        const signal = upsertSignal(signalName, false);

        const watcher = (event: CustomEvent<DatastarSSEEvent>) => {
            const { type, argsRaw: { elID } } = event.detail;
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
