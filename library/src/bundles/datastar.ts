import { Datastar } from "../engine";
import { ServerSentEvents as SSE } from "../plugins/official/backend/actions/sse";
import { Indicator } from "../plugins/official/backend/attributes/indicator";
import { ExecuteScript } from "../plugins/official/backend/watchers/executeScript";
import { MergeFragments } from "../plugins/official/backend/watchers/mergeFragments";
import { MergeSignals } from "../plugins/official/backend/watchers/mergeSignals";
import { RemoveFragments } from "../plugins/official/backend/watchers/removeFragments";
import { RemoveSignals } from "../plugins/official/backend/watchers/removeSignals";
import { Clipboard } from "../plugins/official/browser/actions/clipboard";
import { Intersects } from "../plugins/official/browser/attributes/intersects";
import { Persist } from "../plugins/official/browser/attributes/persist";
import { ReplaceUrl } from "../plugins/official/browser/attributes/replaceUrl";
import { ScrollIntoView } from "../plugins/official/browser/attributes/scrollIntoView";
import { Show } from "../plugins/official/browser/attributes/show";
import { ViewTransition } from "../plugins/official/browser/attributes/viewTransition";
import { Bind } from "../plugins/official/dom/attributes/bind";
import { Class } from "../plugins/official/dom/attributes/class";
import { On } from "../plugins/official/dom/attributes/on";
import { Ref } from "../plugins/official/dom/attributes/ref";
import { Text } from "../plugins/official/dom/attributes/text";
import { Fit } from "../plugins/official/logic/actions/fit";
import { SetAll } from "../plugins/official/logic/actions/setAll";
import { ToggleAll } from "../plugins/official/logic/actions/toggleAll";

Datastar.load(
    // browser
    Clipboard,
    Intersects,
    Persist,
    ReplaceUrl,
    ScrollIntoView,
    Show,
    ViewTransition,
    // dom
    Bind,
    Class,
    On,
    Ref,
    Text,
    // logic
    Fit,
    SetAll,
    ToggleAll,
    // backend
    SSE,
    Indicator,
    MergeFragments,
    MergeSignals,
    RemoveFragments,
    RemoveSignals,
    ExecuteScript,
);
