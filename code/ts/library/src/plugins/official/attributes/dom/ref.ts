// Authors: Delaney Gillilan
// Icon: mdi:cursor-pointer
// Slug: Create a reference to an element
// Description: This attribute creates a reference to an element that can be used in other expressions.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

// Sets the value of the element
export const Ref: AttributePlugin = {
    type: PluginType.Attribute,
    name: "ref",
    mustHaveEmptyKey: true,
    mustNotEmptyExpression: true,
    bypassExpressionFunctionCreation: () => true,
    onLoad: ({ el, expression, signals }) => {
        signals.upsert(expression, el);
        return () => signals.remove(expression);
    },
};
