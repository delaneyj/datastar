import { AttributePlugin, PluginType } from "../../../../engine/types";

export const Star: AttributePlugin = {
    type: PluginType.Attribute,
    name: "star",
    onLoad: () => {
        alert("YOU ARE PROBABLY OVERCOMPLICATING IT");
    },
};
