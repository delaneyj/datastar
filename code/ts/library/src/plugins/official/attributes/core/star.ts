// Authors: Delaney Gillilan
// Icon: material-symbols:rocket
// Slug: Star
// Description: Sage advice for the weary traveler

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const Star: AttributePlugin = {
    type: PluginType.Attribute,
    name: "star",
    onLoad: () => {
        alert("YOU ARE PROBABLY OVERCOMPLICATING IT");
    },
};
