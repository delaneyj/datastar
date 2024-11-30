// Authors: Delaney Gillilan
// Icon: material-symbols:settings-input-antenna
// Slug: Remove fragments from the DOM using a Server-Sent Event
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { WatcherPlugin } from "../../../../engine";
import {
  DefaultFragmentsUseViewTransitions,
  DefaultSettleDurationMs,
  EventTypes,
} from "../../../../engine/consts";
import { PluginType } from "../../../../engine/enums";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { isBoolString } from "../../../../utils/text";
import {
  docWithViewTransitionAPI,
  supportsViewTransitions,
} from "../../../../utils/view-transitions";
import { datastarSSEEventWatcher, SWAPPING_CLASS } from "./sseShared";

export const RemoveFragments: WatcherPlugin = {
  pluginType: PluginType.Watcher,
  name: EventTypes.RemoveFragments,
  onGlobalInit: async () => {
    datastarSSEEventWatcher(
      EventTypes.RemoveFragments,
      ({
        selector,
        settleDuration: settleDurationRaw = `${DefaultSettleDurationMs}`,
        useViewTransition:
        useViewTransitionRaw = `${DefaultFragmentsUseViewTransitions}`,
      }) => {
        if (!!!selector.length) {
          // MISS_SELECTOR – No selector was provided. A selector must be provided to the `remove-fragments` event.
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
          docWithViewTransitionAPI.startViewTransition(() => applyToTargets());
        } else {
          applyToTargets();
        }
      }
    );
  },
};
