import { EffectFn, Signal } from "../vendored/preact-core";
import { SignalsRoot } from "./nestedSignals";

export type OnRemovalFn = () => void;

export enum PluginType {
    Macro,
    Attribute,
    Watcher,
    Action,
}

export enum KeyValRequirement {
    Allowed = 0,
    NotAllowed = 1,
    Required = 2,
    Xor = 3
}

export enum KeyValRules {
    KeyAllowed_ValueAllowed = KeyValRequirement.Allowed << 2 | KeyValRequirement.Allowed,
    KeyAllowed_ValueNotAllowed = KeyValRequirement.Allowed << 2 | KeyValRequirement.NotAllowed,
    KeyAllowed_ValueRequired = KeyValRequirement.Allowed << 2 | KeyValRequirement.Required,
    KeyNotAllowed_ValueAllowed = KeyValRequirement.NotAllowed << 2 | KeyValRequirement.Allowed,
    KeyNotAllowed_ValueNotAllowed = KeyValRequirement.NotAllowed << 2 | KeyValRequirement.NotAllowed,
    KeyNotAllowed_ValueRequired = KeyValRequirement.NotAllowed << 2 | KeyValRequirement.Required,
    KeyRequired_ValueAllowed = KeyValRequirement.Required << 2 | KeyValRequirement.Allowed,
    KeyRequired_ValueNotAllowed = KeyValRequirement.Required << 2 | KeyValRequirement.NotAllowed,
    KeyRequired_ValueRequired = KeyValRequirement.Required << 2 | KeyValRequirement.Required,
    KeyRequired_Xor_ValueRequired = KeyValRequirement.Xor << 2 | KeyValRequirement.Xor,
}

export interface DatastarPlugin {
    type: PluginType; // The type of plugin
    name: string; // The name of the plugin
}

export interface MacroPlugin extends DatastarPlugin {
    type: PluginType.Macro;
    fn: (original: string) => string;
}

export type AllowedModifiers = Set<string>;

// A plugin accesible via a `data-${name}` attribute on an element
export interface AttributePlugin extends DatastarPlugin {
    type: PluginType.Attribute;
    onGlobalInit?: (ctx: InitContext) => void; // Called once on registration of the plugin
    onLoad: (ctx: RuntimeContext) => OnRemovalFn | void; // Return a function to be called on removal
    canHaveKey?: boolean; // Whether the plugin can have a key (if false and a key is provided, the plugin will not be applied)
    mustHaveKey?: boolean; // Whether the plugin must have a key
    mustHaveValue?: boolean; // Whether the plugin must have a value
    mods?: AllowedModifiers; // If not provided, all modifiers are allowed
    keyValRule?: KeyValRules; // The rules for the key and value requirements
    removeOnLoad?: boolean; // If true, the attribute is removed after onLoad (useful for plugins you don’t want reapplied)
    macros?: {
        pre?: MacroPlugin[];
        post?: MacroPlugin[];
    };
    argNames?: string[]; // argument names for the reactive expression
}

// A plugin that runs on the global scope of the DastaStar instance
export interface WatcherPlugin extends DatastarPlugin {
    type: PluginType.Watcher;
    onGlobalInit?: (ctx: InitContext) => void;
}

export type ActionPlugins = Record<string, ActionPlugin>;
export type ActionMethod = (ctx: RuntimeContext, ...args: any[]) => any;

export interface ActionPlugin extends DatastarPlugin {
    type: PluginType.Action;
    fn: ActionMethod;
}

export type GlobalInitializer = (ctx: InitContext) => void;
export type RemovalEntry = { id: string; set: Set<OnRemovalFn> };

export type InitContext = {
    signals: SignalsRoot;
    effect: (fn: EffectFn) => OnRemovalFn;
    actions: Readonly<ActionPlugins>;
    apply: (target: Element) => void;
    cleanup: (el: Element) => void;
};

export type HTMLorSVGElement = Element & (HTMLElement | SVGElement);
export type Modifiers = Map<string, Set<string>>;

export type RuntimeContext = InitContext & {
    el: HTMLorSVGElement; // The element the attribute is on
    rawKey: Readonly<string>; // no parsing data-* key
    rawValue: Readonly<string>; // no parsing data-* value
    value: Readonly<string>; // what the user wrote after any macros run
    key: Readonly<string>; // data-* key without the prefix or modifiers
    mods: Modifiers; // the modifiers and their arguments
    genRX: () => <T>(...args: any[]) => T; // a reactive expression
};

export type NestedValues = { [key: string]: NestedValues | any };
export type NestedSignal = {
    [key: string]: NestedSignal | Signal<any>;
};

export type RuntimeExpressionFunction = (
    ctx: RuntimeContext,
    ...args: any[]
) => any;
