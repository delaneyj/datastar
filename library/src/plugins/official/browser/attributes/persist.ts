// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { dsErr, ErrorCodes } from "../../../../engine/errors";
import { AttributePlugin, PluginType } from "../../../../engine/types";

const SESSION = "session";
const LOCAL = "local";
const REMOTE = "remote";

export const Persist: AttributePlugin = {
    type: PluginType.Attribute,
    name: "persist",
    mods: new Set([LOCAL, SESSION, REMOTE]),
    onLoad: () => {
        throw dsErr(ErrorCodes.NotImplementedError);
    },
};
