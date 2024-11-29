// Authors: Delaney Gillilan
// Icon: mdi:clipboard
// Slug: Copy text to the clipboard
// Description: This action copies text to the clipboard using the Clipboard API.

import { ActionPlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import { ERR_NOT_ALLOWED } from "../../../../engine/errors";

export const Clipboard: ActionPlugin = {
    pluginType: PluginType.Action,
    name: "clipboard",
    method: (_, text) => {
        if (!navigator.clipboard) {
            // Clipboard API not available
            throw ERR_NOT_ALLOWED;
        }
        navigator.clipboard.writeText(text);
    },
};
