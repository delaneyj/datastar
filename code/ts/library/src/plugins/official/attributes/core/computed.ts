// Authors: Delaney Gillilan
// Icon: fluent:draw-text-24-filled
// Slug: Create a computed signal
// Description: This attribute creates a computed signal that updates when its dependencies change.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const Computed: AttributePlugin = {
  pluginType: PluginType.Attribute,
  name: "computed",
  mustNotEmptyKey: true,
  onLoad: (ctx) => {
    const {
      signals,
      key,
      expressionFn,
      reactivity: { computed },
    } = ctx;

    signals[key] = computed(() => {
      return expressionFn(ctx);
    });

    return () => {
      delete signals[ctx.key];
    };
  },
};
