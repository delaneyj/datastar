import { dsErr } from "../../../../engine/errors";
import { AttributePlugin, PluginType } from "../../../../engine/types";

const name = "computed";
export const Computed: AttributePlugin = {
    type: PluginType.Attribute,
    name,
    purge: true,
    onLoad: ({ key, signals, genRX }) => {
        const rx = genRX();
        if (!key.length) {
            throw dsErr("ComputedKeyNotProvided");
        }
        signals.setComputed(key, rx);
    },
};
