import { DATASTAR } from "./consts";

const url = `https://data-star.dev/errors`;

export const hasValNonExpr = /([\w0-9.]+)\.value/gm;

// Error codes use the format `{A-Z}{1-9}` (exluding `I` and `O`). Each file takes a letter, and each error within the file takes a number.
export enum ErrorCodes {
    // Engine
    RequiredPluginNotLoaded = "A1",
    PluginAlreadyLoaded = "A2",
    InvalidPluginType = "A3",
    GenRXFunctionNotImplemented = "A4",
    ExpressionGenerationFailed = "A5",
    // ServerSentEvents
    NoUrlProvided = "B1",
    WrongContentType = "B2",
    SseFailed = "B3",
    // Indicator
    IndicatorKeyNotAllowed = "C1",
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
    ScrollIntoViewValueNotProvided = "M2",
    NotHtmlSvgElement = "M3",
    // Show
    ShowKeyNotAllowed = "N1",
    ShowValueNotProvided = "N2",
    // Computed
    ComputedKeyNotProvided = "P1",
    // Bind
    InvalidExpression = "Q1",
    InvalidResultType = "Q2",
    InvalidDataUri = "Q3",
    UnsupportedType = "Q4",
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
    GetError = "Z3",
    CleanupEffectError = "Z4",
    EndEffectError = "Z5",
    EffectError = "Z6",
}

export const dsErr = (code: string, args?: any) => {
    const e = new Error();
    e.name = `${DATASTAR}${code}`;
    const fullURL = `${url}/code?${new URLSearchParams(args)}`;
    e.message = `${DATASTAR}${code}, for more info see ${fullURL}`;
    return e;
};
