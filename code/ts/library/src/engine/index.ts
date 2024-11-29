import { Computed } from "../plugins/official/attributes/core/computed";
import { Star } from "../plugins/official/attributes/core/star";
import { Store } from "../plugins/official/attributes/core/store";
import { ActionsMacro } from "../plugins/official/macros/core/actions";
import { SignalsMacro } from "../plugins/official/macros/core/signals";
import { Engine } from "./engine";

export { VERSION } from "./consts";

export type * from "./types";

const ds = new Engine();
ds.load(
    ActionsMacro,
    SignalsMacro,
    Store,
    Computed,
    Star,
);

export const Datastar = ds;
