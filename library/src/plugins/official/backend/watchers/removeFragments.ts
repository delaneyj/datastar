// Icon: material-symbols:settings-input-antenna
// Slug: Remove fragments from the DOM using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import {
    DefaultFragmentsUseViewTransitions,
    DefaultSettleDurationMs,
    EventTypes,
} from "../../../../engine/consts";
import { dsErr } from "../../../../engine/errors";
import { PluginType, WatcherPlugin } from "../../../../engine/types";
import { isBoolString } from "../../../../utils/text";
import {
    docWithViewTransitionAPI,
    supportsViewTransitions,
} from "../../../../utils/view-transtions";
import { datastarSSEEventWatcher, SWAPPING_CLASS } from "../shared";

export const RemoveFragments: WatcherPlugin = {
    type: PluginType.Watcher,
    name: EventTypes.RemoveFragments,
    onGlobalInit: async () => {
        datastarSSEEventWatcher(
            EventTypes.RemoveFragments,
            ({
                selector,
                settleDuration: settleDurationRaw =
                    `${DefaultSettleDurationMs}`,
                useViewTransition: useViewTransitionRaw =
                    `${DefaultFragmentsUseViewTransitions}`,
            }) => {
                if (!!!selector.length) {
                    throw dsErr("NoSelectorProvided");
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
            },
        );
    },
};
