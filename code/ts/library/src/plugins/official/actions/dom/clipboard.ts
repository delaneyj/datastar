// Authors: Delaney Gillilan
// Icon: mdi:clipboard
// Slug: Copy text to the clipboard
// Description: This action copies text to the clipboard using the Clipboard API.

import { ActionPlugin } from "../../../../engine";
import { ERR_NOT_ALLOWED } from "../../../../engine/errors";

export const Clipboard: ActionPlugin = {
    pluginType: "action",
    name: "clipboard",
    method: (_, text) => {
        if (!navigator.clipboard) {
            // Clipboard API not available
            throw ERR_NOT_ALLOWED;
        }
        navigator.clipboard.writeText(text);
    },
};
