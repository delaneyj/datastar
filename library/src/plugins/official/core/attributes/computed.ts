import { AttributePlugin, KeyValRules, PluginType } from "../../../../engine/types";

const name = "computed";
export const Computed: AttributePlugin = {
    type: PluginType.Attribute,
    name,
    keyValRule: KeyValRules.KeyRequired_ValueRequired,
    removeOnLoad: true,
    onLoad: ({ key, signals, genRX }) => {
        const rx = genRX();
        signals.setComputed(key, rx);
    },
};
