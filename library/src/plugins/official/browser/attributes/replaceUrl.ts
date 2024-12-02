// Authors: Delaney Gillilan
// Icon: carbon:url
// Slug: Replace the current URL with a new URL
// Description: This plugin allows you to replace the current URL with a new URL.  Once you add this attribute the current URL will be replaced with the new URL.

import { AttributePlugin, PluginType } from "../../../../engine/types";

export const ReplaceUrl: AttributePlugin = {
    type: PluginType.Attribute,
    name: "replaceUrl",
    onLoad: ({ key, value, effect, genRX }) => {
        if (key.length) throw new Error("No key allowed");
        if (!value.length) throw new Error("No value provided");
        const rx = genRX();
        return effect(() => {
            const url = rx<string>();
            const baseUrl = window.location.href;
            const fullUrl = new URL(url, baseUrl).toString();
            window.history.replaceState({}, "", fullUrl);
        });
    },
};
