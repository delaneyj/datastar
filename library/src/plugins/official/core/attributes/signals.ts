import {
    AttributePlugin,
    NestedValues,
    PluginType,
    Requirement,
} from "../../../../engine/types";
import { modifiers } from "../../../../utils/modifiers";
import { jsStrToObject } from "../../../../utils/text";

export const Signals: AttributePlugin = {
    type: PluginType.Attribute,
    name: "signals",
    valReq: Requirement.Must,
    removeOnLoad: true,
    onLoad: (ctx) => {
        const { key, genRX, signals } = ctx;
        const mods = modifiers(ctx);
        if (key != "") {
            signals.setValue(key, genRX()());
        } else {
            const obj = jsStrToObject(ctx.value);
            ctx.value = JSON.stringify(obj);
            const ifMissing = mods?.onlyifmissing ?? false;

            signals.merge(genRX()<NestedValues>(), ifMissing);
        }
    },
};
