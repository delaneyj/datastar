// Authors: Delaney Gillilan
// Icon: material-symbols:settings-input-antenna
// Slug: Merge fine grain signals store data from a server using the Datastar SDK interface
// Description: Merge store data from a server using the Datastar SDK interface

import { WatcherPlugin } from "../../../../engine";
import {
    DefaultFragmentsUseViewTransitions,
    DefaultSettleDurationMs,
    EventTypes,
} from "../../../../engine/consts";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { isBoolString } from "../../../../utils/text";
import {
    docWithViewTransitionAPI,
    supportsViewTransitions,
} from "../../../../utils/view-transitions";
import { datastarSSEEventWatcher, SWAPPING_CLASS } from "./sseShared";

export const RemoveFragments: WatcherPlugin = {
    pluginType: "watcher",
    name: EventTypes.RemoveFragments,
    onGlobalInit: async () => {
        datastarSSEEventWatcher(EventTypes.RemoveFragments, ({
            selector,
            settleDuration: settleDurationRaw = `${DefaultSettleDurationMs}`,
            useViewTransition: useViewTransitionRaw =
                `${DefaultFragmentsUseViewTransitions}`,
        }) => {
            if (!!!selector.length) {
                // No selector provided for remove-fragments
                throw ERR_BAD_ARGS;
            }

            const settleDuration = parseInt(settleDurationRaw);
            const useViewTransition = isBoolString(useViewTransitionRaw);
            const removeTargets = document.querySelectorAll(selector);

            const applyToTargets = () => {
                for (const target of removeTargets) {
                    target.classList.add(SWAPPING_CLASS);
                }

                setTimeout(() => {
                    for (const target of removeTargets) {
                        target.remove();
                    }
                }, settleDuration);
            };

            if (supportsViewTransitions && useViewTransition) {
                docWithViewTransitionAPI.startViewTransition(() =>
                    applyToTargets()
                );
            } else {
                applyToTargets();
            }
        });
    },
};
