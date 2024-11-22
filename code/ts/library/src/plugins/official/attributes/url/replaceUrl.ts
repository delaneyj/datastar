// Authors: Delaney Gillilan
// Icon: carbon:url
// Slug: Replace the current URL with a new URL
// Description: This plugin allows you to replace the current URL with a new URL.  Once you add this attribute the current URL will be replaced with the new URL.

import { AttributePlugin } from "../../../../engine";

export const ReplaceUrl: AttributePlugin = {
    pluginType: "attribute",
    name: "replaceUrl",
    mustHaveEmptyKey: true,
    mustNotEmptyExpression: true,

    onLoad: (ctx) => {
        return ctx.reactivity.effect(() => {
            const value = ctx.expressionFn(ctx);
            const baseUrl = window.location.href;
            const url = new URL(value, baseUrl).toString();

            window.history.replaceState({}, "", url);
        });
    },
};
