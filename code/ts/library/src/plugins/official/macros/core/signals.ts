import { MacroPlugin, RegexpGroups } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import { wholePrefixSuffix } from "../../../../utils/regex";

// Replacing $signal with ctx.store.signal.value`
export const SignalsMacro: MacroPlugin = {
  name: "signal",
  pluginType: PluginType.Macro,
  regexp: wholePrefixSuffix("\\$", "signal", "(?<method>\\([^\\)]*\\))?"),
  replacer: (groups: RegexpGroups) => {
    const { signal, method } = groups;
    const prefix = `ctx.signals()`;
    if (!method?.length) {
      return `${prefix}.${signal}.value`;
    }
    const parts = signal.split(".");
    const methodName = parts.pop();
    const nestedSignal = parts.join(".");
    return `${prefix}.${nestedSignal}.value.${methodName}${method}`;
  },
};
