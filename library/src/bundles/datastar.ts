import { Datastar } from "../engine";
import { ServerSentEvents as SSE } from "../plugins/official/backend/actions/sse";
import { Indicator } from "../plugins/official/backend/attributes/indicator";
import { ExecuteScript } from "../plugins/official/backend/watchers/executeScript";
import { MergeFragments } from "../plugins/official/backend/watchers/mergeFragments";
import { MergeSignals } from "../plugins/official/backend/watchers/mergeSignals";
import { RemoveFragments } from "../plugins/official/backend/watchers/removeFragments";
import { RemoveSignals } from "../plugins/official/backend/watchers/removeSignals";
import { Clipboard } from "../plugins/official/dom/actions/clipboard";
import { Bind } from "../plugins/official/dom/attributes/bind";
import { Class } from "../plugins/official/dom/attributes/class";
import { On } from "../plugins/official/dom/attributes/on";

Datastar.load(
    // dom
    Clipboard,
    Bind,
    Class,
    On,
    // backend
    Indicator,
    MergeFragments,
    MergeSignals,
    RemoveFragments,
    RemoveSignals,
    ExecuteScript,
    SSE,
);
