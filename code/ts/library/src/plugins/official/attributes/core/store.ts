// Authors: Delaney Gillilan
// Icon: material-symbols:home-storage
// Slug: Store signals into a singleton per page
// Description: This action stores signals into a singleton per page. This is useful for storing signals that are used across multiple components.

import {
    AttributeContext,
    AttributePlugin,
    RegexpGroups,
} from "../../../../engine";
import { storeFromPossibleContents } from "../../../../utils/signals";

// Setup the global store
export const Store: AttributePlugin = {
    pluginType: "attribute",
    name: "store",
    removeNewLines: true,
    preprocessors: {
        pre: [
            {
                pluginType: "preprocessor",
                name: "store",
                regexp: /(?<whole>.+)/g,
                replacer: (groups: RegexpGroups) => {
                    const { whole } = groups;
                    return `Object.assign({...ctx.store()}, ${whole})`;
                },
            },
        ],
    },
    allowedModifiers: new Set(["ifmissing"]),
    onLoad: (ctx: AttributeContext) => {
        const possibleMergeSignals = ctx.expressionFn(ctx);
        const actualMergeSignals = storeFromPossibleContents(
            ctx.store(),
            possibleMergeSignals,
            ctx.modifiers.has("ifmissing"),
        );
        ctx.mergeSignals(actualMergeSignals);

        delete ctx.el.dataset[ctx.rawKey];
    },
};
