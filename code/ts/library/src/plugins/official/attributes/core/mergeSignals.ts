// Authors: Delaney Gillilan
// Icon: material-symbols:home-storage
// Slug: Merge signals into a singleton per page
// Description: This action signalss signals into a singleton per page. This is useful for storing signals that are used across multiple components.

import {
  AttributeContext,
  AttributePlugin,
  NestedValues,
} from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

const IF_MISSING = "ifmissing";

// Merge into singleton signals
export const MergeSignals: AttributePlugin = {
  type: PluginType.Attribute,
  name: "mergeSignals",
  onlyMods: new Set([IF_MISSING]),
  onLoad: (ctx: AttributeContext) => {
    const { el, expr, mods } = ctx;
    const possibleMergeValues: NestedValues = expr(ctx);
    ctx.signals.merge(possibleMergeValues, mods.has(IF_MISSING));
    delete el.dataset[ctx.rawKey];
  },
};
