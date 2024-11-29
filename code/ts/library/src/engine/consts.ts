// This is auto-generated by Datastar. DO NOT EDIT.

export const DATASTAR = "datastar";
export const DATASTAR_EVENT = "datastar-event";
export const DATASTAR_REQUEST = "Datastar-Request";
export const VERSION = "0.20.1";

// #region Defaults

// #region Default durations

// The default duration for settling during merges. Allows for CSS transitions to complete.
export const DefaultSettleDurationMs = 300;
// The default duration for retrying SSE on connection reset. This is part of the underlying retry mechanism of SSE.
export const DefaultSseRetryDurationMs = 1000;

// #endregion


// #region Default strings

// The default attributes for <script/> element use when executing scripts. It is a set of of key-value pairs delimited by a newline \\n character.
export const DefaultExecuteScriptAttributes = "type module";

// #endregion


// #region Default booleans

// Should fragments be merged using the ViewTransition API?
export const DefaultFragmentsUseViewTransitions = false;

// Should a given set of signals merge if they are missing?
export const DefaultMergeSignalsOnlyIfMissing = false;

// Should script element remove itself after execution?
export const DefaultExecuteScriptAutoRemove = true;

// #endregion


// #region Enums

// The mode in which a fragment is merged into the DOM.
export const FragmentMergeModes = {
    // Morphs the fragment into the existing element using idiomorph.
    Morph: "morph",
    // Replaces the inner HTML of the existing element.
    Inner: "inner",
    // Replaces the outer HTML of the existing element.
    Outer: "outer",
    // Prepends the fragment to the existing element.
    Prepend: "prepend",
    // Appends the fragment to the existing element.
    Append: "append",
    // Inserts the fragment before the existing element.
    Before: "before",
    // Inserts the fragment after the existing element.
    After: "after",
    // Upserts the attributes of the existing element.
    UpsertAttributes: "upsertAttributes",
} as const;

// Default value for FragmentMergeMode
export const DefaultFragmentMergeMode = FragmentMergeModes.Morph;

// The type protocol on top of SSE which allows for core pushed based communication between the server and the client.
export const EventTypes = {
    // An event for merging HTML fragments into the DOM.
    MergeFragments: "datastar-merge-fragments",
    // An event for merging signals.
    MergeSignals: "datastar-merge-signals",
    // An event for removing HTML fragments from the DOM.
    RemoveFragments: "datastar-remove-fragments",
    // An event for removing signals.
    RemoveSignals: "datastar-remove-signals",
    // An event for executing <script/> elements in the browser.
    ExecuteScript: "datastar-execute-script",
} as const;
// #endregion

// #endregion