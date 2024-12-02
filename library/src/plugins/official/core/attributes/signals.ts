import {
    AttributePlugin,
    NestedValues,
    PluginType,
} from "../../../../engine/types";

export const Signals: AttributePlugin = {
    type: PluginType.Attribute,
    name: "signals",
    purge: true,
    onLoad: ({ key, signals, genRX }) => {
        const rx = genRX();
        const toMerge = rx<NestedValues>();
        if (key) {
            signals.setValue(key, toMerge);
        } else {
            signals.merge(toMerge);
        }
    },
};
