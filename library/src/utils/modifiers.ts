import { RuntimeContext } from "../engine/types";

export const modifierSignalPrefix = "_modifiers";

export function modifiers(
    ctx: RuntimeContext,
) {
    const { el, rawKey } = ctx;
    const path = [modifierSignalPrefix, el.id, rawKey]
        .join(".");
    const subset = ctx.signals.subset(path);

    return subset?.[modifierSignalPrefix]?.[el.id]?.[rawKey] ?? {};
}
