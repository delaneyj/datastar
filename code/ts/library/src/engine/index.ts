import { ActionsMacro, SignalsGetMacro, SignalsSetMacro } from "../plugins";
import { Computed } from "../plugins/official/attributes/core/computed";
import { MergeSignals } from "../plugins/official/attributes/core/mergeSignals";
import { Star } from "../plugins/official/attributes/core/star";
import { Engine } from "./engine";

export { VERSION } from "./consts";

export type * from "./types";

const ds = new Engine();
ds.load(
    Star,
    ActionsMacro,
    SignalsSetMacro,
    SignalsGetMacro,
    MergeSignals,
    Computed,
);

export const Datastar = ds;
