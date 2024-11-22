// Authors: Delaney Gillilan
// Icon: mdi:floppy-variant
// Slug: Persist data to local storage or session storage
// Description: This plugin allows you to persist data to local storage or session storage.  Once you add this attribute the data will be persisted to local storage or session storage.

import { AttributePlugin } from "../../../../engine";
import { DATASTAR, DATASTAR_EVENT } from "../../../../engine/consts";
import { remoteSignals } from "../../../../utils/signals";
import { DatastarSSEEvent } from "../../watchers/backend/sseShared";

export const Persist: AttributePlugin = {
    pluginType: "attribute",
    name: "persist",
    allowedModifiers: new Set(["local", "session", "remote"]),
    onLoad: (ctx) => {
        const key = ctx.key || DATASTAR;
        const expression = ctx.expression;
        const keys = new Set<string>();

        if (expression.trim() !== "") {
            const value = ctx.expressionFn(ctx);
            const parts = value.split(" ");
            for (const part of parts) {
                keys.add(part);
            }
        }

        let lastMarshalled = "";
        const storageType = ctx.modifiers.has("session") ? "session" : "local";
        const useRemote = ctx.modifiers.has("remote");

        const storeUpdateHandler = ((_: CustomEvent<DatastarSSEEvent>) => {
            let store = ctx.store();
            if (useRemote) {
                store = remoteSignals(store);
            }
            if (keys.size > 0) {
                const newStore: Record<string, any> = {};
                for (const key of keys) {
                    const parts = key.split(".");
                    let newSubstore = newStore;
                    let subStore = store;
                    for (let i = 0; i < parts.length - 1; i++) {
                        const part = parts[i];
                        if (!newSubstore[part]) {
                            newSubstore[part] = {};
                        }
                        newSubstore = newSubstore[part];
                        subStore = subStore[part];
                    }

                    const lastPart = parts[parts.length - 1];
                    newSubstore[lastPart] = subStore[lastPart];
                }
                store = newStore;
            }

            const marshalledStore = JSON.stringify(store);

            if (marshalledStore === lastMarshalled) {
                return;
            }

            if (storageType === "session") {
                window.sessionStorage.setItem(key, marshalledStore);
            } else {
                window.localStorage.setItem(key, marshalledStore);
            }

            lastMarshalled = marshalledStore;
        }) as EventListener;

        window.addEventListener(DATASTAR_EVENT, storeUpdateHandler);

        let marshalledStore: string | null;

        if (storageType === "session") {
            marshalledStore = window.sessionStorage.getItem(key);
        } else {
            marshalledStore = window.localStorage.getItem(key);
        }

        if (!!marshalledStore) {
            const store = JSON.parse(marshalledStore);
            for (const key in store) {
                ctx.upsertSignal(key, store[key]);
            }
        }

        return () => {
            window.removeEventListener(DATASTAR_EVENT, storeUpdateHandler);
        };
    },
};
