const url = `http://localhost:8080/errors`;

export const hasValNonExpr = /([\w0-9.]+)\.value/gm;

// Error codes use the format `{A-Z}{1-9}` (exluding `I` and `O`). Each file takes a letter, and each error within the file takes a number.
export enum ErrorCodes {
    // Engine
    RequiredPluginNotLoaded = "A1",
    InvalidPluginType = "A2",
    GeneratingExpressionFailed = "A3",
    // ServerSentEvents
    NoUrlProvided = "B1",
    InvalidContentType = "B2",
    SseFailed = "B3",
    // Indicator
    IndicatorKeyNotAllowed = "C1",
    IndicatorValueNotProvided = "C2",
    // ExecuteScript
    NoScriptProvided = "D1",
    // MergeFragments
    NoFragmentsFound = "E1",
    NoTargetsFound = "E2",
    MorphFailed = "E3",
    InvalidMergeMode = "E4",
    // RemoveFragments
    NoSelectorProvided = "F1",
    // RemoveSignals
    NoPathsProvided = "G1",
    // Clipboard
    ClipboardNotAvailable = "H1",
    // Intersects
    IntersectsKeyNotAllowed = "J1",
    // Persist
    NotImplementedError = "K1",
    // ReplaceUrl
    ReplaceUrlKeyNotAllowed = "L1",
    ReplaceUrlValueNotProvided = "L2",
    // ScrollIntoView
    ScrollIntoViewKeyNotAllowed = "M1",
    ScrollIntoViewValueNotAllowed = "M2",
    NotHtmlSvgElement = "M3",
    // Show
    ShowKeyNotAllowed = "N1",
    ShowValueNotProvided = "N2",
    // Computed
    ComputedKeyNotProvided = "P1",
    // Bind
    BindKeyNotAllowed = "Q1",
    InvalidExpression = "Q2",
    InvalidFileResultType = "Q3",
    InvalidDataUri = "Q4",
    UnsupportedSignalType = "Q5",
    // On
    InvalidValue = "R1",
    // Ref
    RefKeyNotAllowed = "S1",
    RefValueNotProvided = "S2",
    // Idiomorph (vendored)
    NoBestMatchFound = "Y1",
    InvalidMorphStyle = "Y2",
    NoParentElementFound = "Y3",
    NewElementCouldNotBeCreated = "Y4",
    NoTemporaryNodeFound = "Y5",
    NoContentFound = "Y6",
    // Preact Core (vendored)
    BatchError = "Z1",
    SignalCycleDetected = "Z2",
    GetComputedError = "Z3",
    CleanupEffectError = "Z4",
    EndEffectError = "Z5",
    EffectError = "Z6",
}

export const dsErr = (code: ErrorCodes, args?: any) => {
    const e = new Error();
    e.name = `Datastar error ${code}`;
    const fullURL = `${url}/${code}?${new URLSearchParams(args)}`;
    e.message = `for more info see ${fullURL}`;
    return e;
};
