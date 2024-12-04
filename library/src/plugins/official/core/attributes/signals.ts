import {
    AttributePlugin,
    KeyValRules,
    NestedValues,
    PluginType,
} from "../../../../engine/types";
import { jsStrToObject } from "../../../../utils/text";

export const Signals: AttributePlugin = {
    type: PluginType.Attribute,
    name: "signals",
    keyValRule: KeyValRules.KeyAllowed_ValueRequired,
    removeOnLoad: true,
    onLoad: (ctx) => {
        const { key, genRX, signals } = ctx;
        if (key != "") {
            signals.setValue(key, genRX()());
        } else {
            const obj = jsStrToObject(ctx.value);
            ctx.value = JSON.stringify(obj);
            signals.merge(genRX()<NestedValues>());
        }
    },
};
