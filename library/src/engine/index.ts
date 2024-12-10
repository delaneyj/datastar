import { Computed } from "../plugins/official/core/attributes/computed";
import { Modifiers } from "../plugins/official/core/attributes/modifiers";
import { Signals } from "../plugins/official/core/attributes/signals";
import { Star } from "../plugins/official/core/attributes/star";
import { SignalValueMacro } from "../plugins/official/core/macros/signals";
import { Engine } from "./engine";

const ds = new Engine();
ds.load(
    Star,
    SignalValueMacro,
    Modifiers,
    Signals,
    Computed,
);
export const Datastar = ds;
