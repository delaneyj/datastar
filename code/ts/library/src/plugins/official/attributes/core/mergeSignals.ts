// Authors: Delaney Gillilan
// Icon: material-symbols:home-storage
// Slug: Merge signals into a singleton per page
// Description: This action signalss signals into a singleton per page. This is useful for storing signals that are used across multiple components.

import {
    AttributeContext,
    AttributePlugin,
    RegexpGroups,
} from "../../../../engine";
import { signalsFromPossibleContents } from "../../../../utils/signals";

// Merge into singleton signals
export const MergeSignals: AttributePlugin = {
    pluginType: "attribute",
    name: "mergeSignals",
    removeNewLines: true,
    preprocessors: {
        pre: [
            {
                pluginType: "preprocessor",
                name: "signals",
                regexp: /(?<whole>.+)/g,
                replacer: (groups: RegexpGroups) => {
                    const { whole } = groups;
                    return `Object.assign({...ctx.signals()}, ${whole})`;
                },
            },
        ],
    },
    allowedModifiers: new Set(["ifmissing"]),
    onLoad: (ctx: AttributeContext) => {
        const possibleMergeSignals = ctx.expressionFn(ctx);
        const actualMergeSignals = signalsFromPossibleContents(
            ctx.signals(),
            possibleMergeSignals,
            ctx.modifiers.has("ifmissing"),
        );
        ctx.mergeSignals(actualMergeSignals);

        delete ctx.el.dataset[ctx.rawKey];
    },
};
