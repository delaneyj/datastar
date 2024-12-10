import {
    AttributePlugin,
    NestedValues,
    PluginType,
    Requirement,
} from "../../../../engine/types";
import { modifierSignalPrefix } from "../../../../utils/modifiers";

export const Modifiers: AttributePlugin = {
    type: PluginType.Attribute,
    name: "modifiers",
    valReq: Requirement.Must,
    onLoad: (ctx) => {
        const { el, key, genRX, signals, effect } = ctx;
        const path = [modifierSignalPrefix, el.id];
        const rx = genRX();
        const cleanupSetModifiers = effect(() => {
            if (key != "") {
                const val = rx();
                signals.setValue([...path, key].join("."), val);
            } else {
                signals.merge({ [modifierSignalPrefix]: rx<NestedValues>() });
            }
        });

        return () => {
            cleanupSetModifiers();
            signals.remove(path.join("."));
        };
    },
};
