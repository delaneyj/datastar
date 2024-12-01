import { MacroPlugin, RegexpGroups } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

// Replacing $signal with ctx.signals.signal.value`
export const SignalsGetMacro: MacroPlugin = {
  name: "get$",
  type: PluginType.Macro,
  regexp: /(?<whole>\$(?<key>\w*))/gm,
  alter: (groups: RegexpGroups) => {
    const { key } = groups;
    return `ctx.signals.value('${key}')`;
  },
};

export const SignalsSetMacro: MacroPlugin = {
  name: "set$",
  type: PluginType.Macro,
  regexp: /(?<whole>\$(?<key>\w*)\s*=\s*(?<value>\w*))/gm,
  alter: ({ key, value }) => {
    return `ctx.signals.set("${key}", ${value})`;
  },
};
