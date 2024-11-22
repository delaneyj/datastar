// Authors: Delaney Gillilan
// Icon: material-symbols:rocket
// Slug: Star
// Description: Sage advice for the weary traveler

import { AttributePlugin } from "../../../../engine";

export const Star: AttributePlugin = {
    pluginType: "attribute",
    name: "star",
    onLoad: () => {
        alert("YOU ARE PROBABLY OVERCOMPLICATING IT");
    },
};
