// Authors: Delaney Gillilan
// Icon: mdi:clipboard
// Slug: Copy text to the clipboard
// Description: This action copies text to the clipboard using the Clipboard API.

import { dsErr, ErrorCodes } from "../../../../engine/errors";
import { ActionPlugin, PluginType } from "../../../../engine/types";

export const Clipboard: ActionPlugin = {
    type: PluginType.Action,
    name: "clipboard",
    fn: (_, text) => {
        if (!navigator.clipboard) {
            throw dsErr(ErrorCodes.ClipboardNotAvailable);
        }
        navigator.clipboard.writeText(text);
    },
};
