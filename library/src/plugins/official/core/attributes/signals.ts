import {
    AttributePlugin,
    NestedValues,
    PluginType,
    Requirement,
} from "#engine/types";
import { jsStrToObject } from "#utils/text";

export const Signals: AttributePlugin = {
    type: PluginType.Attribute,
    name: "signals",
    valReq: Requirement.Must,
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
