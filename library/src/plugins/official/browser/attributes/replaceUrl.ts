// Authors: Delaney Gillilan
// Icon: carbon:url
// Slug: Replace the current URL with a new URL
// Description: This plugin allows you to replace the current URL with a new URL.  Once you add this attribute the current URL will be replaced with the new URL.

import { AttributePlugin, KeyValRules, PluginType } from "../../../../engine/types";

export const ReplaceUrl: AttributePlugin = {
    type: PluginType.Attribute,
    name: "replaceUrl",
    keyValRule: KeyValRules.KeyNotAllowed_ValueRequired,
    onLoad: ({ effect, genRX }) => {
        const rx = genRX();
        return effect(() => {
            const url = rx<string>();
            const baseUrl = window.location.href;
            const fullUrl = new URL(url, baseUrl).toString();
            window.history.replaceState({}, "", fullUrl);
        });
    },
};
