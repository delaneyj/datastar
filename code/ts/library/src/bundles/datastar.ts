import { Datastar } from "../engine";
import { RemoteSignals } from "../plugins/official/actions/backend/remote";
import { DeleteSSE } from "../plugins/official/actions/backend/sseDelete";
import { GetSSE } from "../plugins/official/actions/backend/sseGet";
import { PatchSSE } from "../plugins/official/actions/backend/ssePatch";
import { PostSSE } from "../plugins/official/actions/backend/ssePost";
import { PutSSE } from "../plugins/official/actions/backend/ssePut";
import { Clipboard } from "../plugins/official/actions/dom/clipboard";
import { SetAll } from "../plugins/official/actions/logic/setAll";
import { ToggleAll } from "../plugins/official/actions/logic/toggleAll";
import { ClampFit } from "../plugins/official/actions/math/clampFit";
import { ClampFitInt } from "../plugins/official/actions/math/clampFitInt";
import { Fit } from "../plugins/official/actions/math/fit";
import { FitInt } from "../plugins/official/actions/math/fitInt";
import { Indicator } from "../plugins/official/attributes/backend/indicator";
import { Bind } from "../plugins/official/attributes/dom/bind";
import { Class } from "../plugins/official/attributes/dom/class";
import { Model } from "../plugins/official/attributes/dom/model";
import { On } from "../plugins/official/attributes/dom/on";
import { Ref } from "../plugins/official/attributes/dom/ref";
import { Text } from "../plugins/official/attributes/dom/text";
import { Persist } from "../plugins/official/attributes/storage/persist";
import { ReplaceUrl } from "../plugins/official/attributes/url/replaceUrl";
import { Intersection } from "../plugins/official/attributes/visibility/intersects";
import { ScrollIntoView } from "../plugins/official/attributes/visibility/scrollIntoView";
import { Show } from "../plugins/official/attributes/visibility/show";
import { ViewTransition } from "../plugins/official/attributes/visibility/viewTransition";
import { ExecuteScript } from "../plugins/official/watchers/backend/sseExecuteScript";
import { MergeFragments } from "../plugins/official/watchers/backend/sseMergeFragment";
import { MergeSignals } from "../plugins/official/watchers/backend/sseMergeSignals";
import { RemoveFragments } from "../plugins/official/watchers/backend/sseRemoveFragments";
import { RemoveSignals } from "../plugins/official/watchers/backend/sseRemoveSignals";

Datastar.load(
    // attributes
    Model,
    Ref,
    Indicator,
    Bind,
    ReplaceUrl,
    Class,
    On,
    Text,
    Persist,
    Intersection,
    ScrollIntoView,
    Show,
    ViewTransition,
    // actions
    RemoteSignals,
    DeleteSSE,
    GetSSE,
    PatchSSE,
    PostSSE,
    PutSSE,
    Clipboard,
    SetAll,
    ToggleAll,
    ClampFit,
    ClampFitInt,
    Fit,
    FitInt,
    // effects
    MergeFragments,
    MergeSignals,
    RemoveFragments,
    RemoveSignals,
    ExecuteScript,
);
