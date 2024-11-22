import { PreprocessorPlugin, RegexpGroups } from "../../../../engine";
import { wholePrefixSuffix } from "../../../../utils/regex";

// Replacing $action(args) with ctx.actions.action(ctx, args)
export const ActionsProcessor: PreprocessorPlugin = {
    name: "action",
    pluginType: "preprocessor",
    regexp: wholePrefixSuffix(
        "\\$",
        "action",
        "(?<call>\\((?<args>.*)\\))",
        false,
    ),
    replacer: ({ action, args }: RegexpGroups) => {
        const withCtx = [`ctx`];
        if (args) {
            withCtx.push(...args.split(",").map((x) => x.trim()));
        }
        const argsJoined = withCtx.join(",");
        return `ctx.actions.${action}.method(${argsJoined})`;
    },
};
