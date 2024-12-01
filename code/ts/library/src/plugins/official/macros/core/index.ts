// We don't use these exports, they are purely for access via package managers like NPM

import { MacroPlugin, RegexpGroups } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

const validJSIdentifier = `[a-zA-Z_$]+`;
const validNestedJSIdentifier = validJSIdentifier + `[0-9a-zA-Z_$.]*`;

// Replacing $signal with ctx.signals.signal.value`
export const SignalsGetMacro: MacroPlugin = {
  name: "get$",
  type: PluginType.Macro,
  regexp: new RegExp(`(?<whole>\\$(?<key>${validNestedJSIdentifier}))`, "gm"),
  alter: (groups: RegexpGroups) => {
    const { key } = groups;
    return `ctx.signals.value('${key}')`;
  },
};

export const SignalsSetMacro: MacroPlugin = {
  name: "set$",
  type: PluginType.Macro,
  regexp: new RegExp(
    `(?<whole>\\$(?<key>${validNestedJSIdentifier})\\s*=\\s*(?<value>[\\w.(),]*))`,
    "gm"
  ),
  alter: ({ key, value }) => {
    return `ctx.signals.set("${key}", ${value})`;
  },
};

export const ActionsMacro: MacroPlugin = {
  name: "action",
  type: PluginType.Macro,
  regexp: new RegExp(
    `(?<whole>@(?<method>${validJSIdentifier})\\((?<args>.*)\\))`,
    "gm"
  ),
  alter: ({ action, args }: RegexpGroups) => {
    const withCtx = [`ctx`];
    if (args) {
      withCtx.push(...args.split(",").map((x) => x.trim()));
    }
    const argsJoined = withCtx.join(",");
    return `ctx.actions.${action}.fn(${argsJoined})`;
  },
};
