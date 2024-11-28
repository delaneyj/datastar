import { Computed } from "../plugins/official/attributes/core/computed";
import { Store } from "../plugins/official/attributes/core/mergeSignals";
import { Star } from "../plugins/official/attributes/core/star";
import { ActionsProcessor } from "../plugins/official/preprocessors/core/actions";
import { SignalsProcessor } from "../plugins/official/preprocessors/core/signals";
import { Engine } from "./engine";

export { VERSION } from "./consts";

export type * from "./types";

const ds = new Engine();
ds.load(
    ActionsProcessor,
    SignalsProcessor,
    Store,
    Computed,
    Star,
);

export const Datastar = ds;
