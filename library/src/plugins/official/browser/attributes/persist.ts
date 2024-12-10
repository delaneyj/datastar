// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { DATASTAR } from "../../../../engine/consts";
import {
    AttributePlugin,
    NestedValues,
    PluginType,
} from "../../../../engine/types";
import { modifiers } from "../../../../utils/modifiers";

const SESSION = "session";

export const Persist: AttributePlugin = {
    type: PluginType.Attribute,
    name: "persist",
    onLoad: (ctx) => {
        let { key, value, signals, effect } = ctx;
        if (key === "") {
            key = DATASTAR;
        }
        const mods = modifiers(ctx);
        const storage = mods?.mode === SESSION ? sessionStorage : localStorage;
        const paths = value.split(/\s+/).filter((p) => p !== "");

        const storageToSignals = () => {
            const data = storage.getItem(key) || "{}";
            const nestedValues = JSON.parse(data);
            signals.merge(nestedValues);
        };

        const signalsToStorage = () => {
            let nv: NestedValues;
            if (!!!paths.length) {
                nv = signals.values();
            } else {
                nv = signals.subset(...paths);
            }
            storage.setItem(key, JSON.stringify(nv));
        };

        storageToSignals();
        return effect(() => {
            signalsToStorage();
        });
    },
};
