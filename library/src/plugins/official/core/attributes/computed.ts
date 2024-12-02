import { dsErr } from "../../../../engine/errors";
import {
    AttributePlugin,
    NestedValues,
    PluginType,
} from "../../../../engine/types";
import { Computed as PreactComputed } from "../../../../vendored/preact-core";

const name = "computed";
export const Computed: AttributePlugin = {
    type: PluginType.Attribute,
    name,
    purge: true,
    onLoad: ({ key, signals, rx, reactivity: { computed } }) => {
        if (!key) {
            throw dsErr("must have a key", { name });
        }
        const signal = computed(() => {
            return rx<NestedValues>();
        }) as PreactComputed;
        signals.setSignal(key, signal);
    },
};
