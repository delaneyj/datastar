// Authors: Delaney Gillilan
// Icon: tabler:typography
// Slug: Set the text content of an element
// Description: This attribute sets the text content of an element to the result of the expression.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import { ERR_BAD_ARGS } from "../../../../engine/errors";

export const Text: AttributePlugin = {
  type: PluginType.Attribute,
  name: "text",
  noKey: true,
  onLoad: (ctx) => {
    const {
      el,
      expr,
      reactivity: { effect },
    } = ctx;
    if (!(el instanceof HTMLElement)) {
      // Element is not HTMLElement
      throw ERR_BAD_ARGS;
    }
    return effect(() => {
      const res = expr(ctx);
      el.textContent = `${res}`;
    });
  },
};
