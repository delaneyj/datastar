// Authors: Delaney Gillilan
// Icon: carbon:url
// Slug: Replace the current URL with a new URL
// Description: This plugin allows you to replace the current URL with a new URL.  Once you add this attribute the current URL will be replaced with the new URL.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";

export const ReplaceUrl: AttributePlugin = {
  type: PluginType.Attribute,
  name: "replaceUrl",
  noKey: true,
  mustValue: true,

  onLoad: (ctx) => {
    const {
      expr,
      reactivity: { effect },
    } = ctx;
    return effect(() => {
      const value = expr(ctx);
      const baseUrl = window.location.href;
      const url = new URL(value, baseUrl).toString();

      window.history.replaceState({}, "", url);
    });
  },
};
