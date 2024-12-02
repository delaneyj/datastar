import { ReadonlySignal, Signal } from "../vendored/preact-core";
import { SignalsRoot } from "./nestedSignals";

export type OnRemovalFn = () => void;
export type Reactivity = {
    signal: <T>(value: T) => Signal<T>;
    computed: <T>(fn: () => T) => ReadonlySignal<T>;
    effect: (cb: () => void) => OnRemovalFn;
};

export enum PluginType {
    Macro,
    Attribute,
    Watcher,
    Action,
}

export interface DatastarPlugin {
    type: PluginType; // The type of plugin
    name: string; // The name of the plugin
    requires?: Set<DatastarPlugin>; // If not provided, no plugins are required
}

export interface MacroPlugin extends DatastarPlugin {
    type: PluginType.Macro;
    fn: (original: string) => string;
}

export type ModifierDefinition = {
    name: string;
    args: Record<
        string,
        | { type: "string"; default: string }
        | { type: "number"; default: number }
        | { type: "boolean"; default: boolean }
    >;
};
export type ModifierArgs = Record<string, string | number | boolean>;

// A plugin accesible via a `data-${name}` attribute on an element
export interface AttributePlugin extends DatastarPlugin {
    type: PluginType;
    onGlobalInit?: (ctx: InitContext) => void; // Called once on registration of the plugin
    onLoad: (ctx: RuntimeContext) => OnRemovalFn | void; // Return a function to be called on removal
    mods?: Set<ModifierDefinition>; // If not provided, all modifiers are allowed
    macros?: {
        pre?: MacroPlugin[];
        post?: MacroPlugin[];
    };
}

export type ActionPlugins = Record<string, ActionPlugin>;
export type ActionMethod = (ctx: RuntimeContext, ...args: any[]) => any;

export interface ActionPlugin extends DatastarPlugin {
    type: PluginType.Action;
    fn: ActionMethod;
}

export type InitContext = {
    signals: SignalsRoot;
    actions: Readonly<ActionPlugins>;
    reactivity: Reactivity;
    applyPlugins: (target: Element) => void;
    cleanup: (el: Element) => void;
};

export type HTMLorSVGElement = Element & (HTMLElement | SVGElement);

export type RuntimeExpressionFunction = (
    ctx: RuntimeContext,
    ...args: any
) => any;

export type RuntimeContext = InitContext & {
    el: Readonly<HTMLorSVGElement>; // The element the attribute is on
    key: Readonly<string>; // data-* key without the prefix or modifiers
    rawKey: Readonly<string>; // no parsing data-* key
    rawValue: Readonly<string>; // no parsing data-* value
    value: Readonly<string>; // what the user wrote after any macros run
    genExpr: () => RuntimeExpressionFunction; // a reactive function
    mods: ModifierArgs; // the modifiers and their arguments
};

export type NestedValues = { [key: string]: NestedValues | any };
export type NestedSignal = { [key: string]: NestedSignal | Signal<any> };
