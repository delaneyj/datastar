// Authors: Delaney Gillilan
// Icon: material-symbols:masked-transitions
// Slug: Setup view transitions
// Description: This attribute plugin sets up view transitions for the current view. This plugin requires the view transition API to be enabled in the browser. If the browser does not support view transitions, an error will be logged to the console.

import { AttributePlugin } from "../../../../engine";
import { supportsViewTransitions } from "../../../../utils/view-transitions";

const VIEW_TRANSITION = "view-transition";

export const ViewTransition: AttributePlugin = {
    pluginType: "attribute",
    name: VIEW_TRANSITION,
    onGlobalInit() {
        let hasViewTransitionMeta = false;
        document.head.childNodes.forEach((node) => {
            if (
                node instanceof HTMLMetaElement &&
                node.name === VIEW_TRANSITION
            ) {
                hasViewTransitionMeta = true;
            }
        });

        if (!hasViewTransitionMeta) {
            const meta = document.createElement("meta");
            meta.name = VIEW_TRANSITION;
            meta.content = "same-origin";
            document.head.appendChild(meta);
        }
    },
    onLoad: (ctx) => {
        if (!supportsViewTransitions) {
            console.error("Browser does not support view transitions");
            return;
        }

        return ctx.reactivity.effect(() => {
            const { el, expressionFn } = ctx;
            let name = expressionFn(ctx);
            if (!name) return;

            const elVTASTyle = el.style as unknown as CSSStyleDeclaration;
            elVTASTyle.viewTransitionName = name;
        });
    },
};
