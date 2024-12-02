import { walkNestedValues } from "../../../../engine/nestedSignals";
import {
    AttributePlugin,
    NestedValues,
    PluginType,
} from "../../../../engine/types";
import { computed } from "../../../../vendored/preact-core";

const name = "computed";
export const Computed: AttributePlugin = {
    type: PluginType.Attribute,
    name,
    purge: true,
    onLoad: ({ key, signals, genRX }) => {
        const rx = genRX();
        if (key.length) {
            signals.setComputed(key, rx);
        } else {
            computed(() => {
                const vals = rx<NestedValues>();
                walkNestedValues(vals, (path, value) => {
                    signals.setComputed(path, () => value);
                });
            });
        }
    },
};
