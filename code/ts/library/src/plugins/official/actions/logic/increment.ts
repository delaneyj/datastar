// Authors: Delaney Gillilan
// Icon: ion:checkmark-round
// Slug: Set all signals that match a regular expression

import { ActionPlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const Increment: ActionPlugin = {
  type: PluginType.Action,
  name: "increment",
  fn: (ctx, singalKeyPath, delta) => {
    const signal = ctx.signals.upsert(singalKeyPath, 0);
    signal.value += delta;
  },
};
