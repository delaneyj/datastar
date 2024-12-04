// Authors: Delaney Gillilan
// Icon: mdi:cursor-pointer
// Slug: Create a reference to an element
// Description: This attribute creates a reference to an element that can be used in other expressions.

import { dsErr } from "../../../../engine/errors";
import { AttributePlugin, KeyValRules, PluginType } from "../../../../engine/types";

// Sets the value of the element
export const Ref: AttributePlugin = {
    type: PluginType.Attribute,
    name: "ref",
    keyValRule: KeyValRules.KeyRequired_Xor_ValueRequired,
    onLoad: ({ el, key, value, signals }) => {
        const hasKey = key.length > 0;
        const hasValue = value.length > 0;
        if ((hasKey && hasValue) || (!hasKey && !hasValue)) {
            throw dsErr("XORKeyAndValue");
        }
        const signalName = hasKey ? key : value;
        signals.upsert(signalName, el);
        return () => signals.setValue(signalName, null);
    },
};
