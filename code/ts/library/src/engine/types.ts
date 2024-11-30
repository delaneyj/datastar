import { ReadonlySignal, Signal } from "../vendored/preact-core";
import { PluginType } from "./enums";
import { SignalsRoot } from "./nestedSignals";

export type HTMLorSVGElement = Element & (HTMLElement | SVGElement);

export type InitExpressionFunction = (ctx: InitContext, ...args: any) => any;
export type AttribtueExpressionFunction = (
  ctx: AttributeContext,
  ...args: any
) => any;
export type Reactivity = {
  signal: <T>(value: T) => Signal<T>;
  computed: <T>(fn: () => T) => ReadonlySignal<T>;
  effect: (cb: () => void) => OnRemovalFn;
};

export type InitContext = {
  signals: SignalsRoot;
  actions: Readonly<ActionPlugins>;
  reactivity: Reactivity;
  applyPlugins: (target: Element) => void;
  cleanup: (el: Element) => void;
};

export type AttributeContext = InitContext & {
  el: Readonly<HTMLorSVGElement>; // The element the attribute is on
  key: Readonly<string>; // data-* key without the prefix or modifiers
  rawKey: Readonly<string>; // raw data-* key
  rawExpression: Readonly<string>; // before any macros run, what the user wrote
  expression: Readonly<string>; // what the user wrote after any macros run
  expressionFn: AttribtueExpressionFunction; // the function constructed from the expression
  modifiers: Map<string, string[]>; // the modifiers and their arguments
};

export type OnRemovalFn = () => void;

export interface DatastarPlugin {
  type: PluginType; // The type of plugin
  name: string; // The name of the plugin
  requiredPlugins?: Set<DatastarPlugin>; // If not provided, no plugins are required
}

// A plugin accesible via a `data-${name}` attribute on an element
export interface AttributePlugin extends DatastarPlugin {
  type: PluginType;
  onGlobalInit?: (ctx: InitContext) => void; // Called once on registration of the plugin
  onLoad: (ctx: AttributeContext) => OnRemovalFn | void; // Return a function to be called on removal
  allowedModifiers?: Set<string>; // If not provided, all modifiers are allowed
  mustHaveEmptyExpression?: boolean; // The contents of the data-* attribute must be empty
  mustNotEmptyExpression?: boolean; // The contents of the data-* attribute must not be empty
  mustHaveEmptyKey?: boolean; // The key of the data-* attribute must be empty after the prefix
  mustNotEmptyKey?: boolean; // The key of the data-* attribute must not be empty after the prefix
  allowedTagRegexps?: Set<string>; // If not provided, all tags are allowed
  disallowedTags?: Set<string>; // If not provided, no tags are disallowed
  macros?: {
    pre?: MacroPlugin[];
    post?: MacroPlugin[];
  };
  removeNewLines?: boolean; // If true, the expression is not split by commas
  bypassExpressionFunctionCreation?: (ctx: AttributeContext) => boolean; // If true, the expression function is not created
  argumentNames?: Readonly<string[]>; // The names of the arguments passed to the expression function
}

export type RegexpGroups = Record<string, string>;

// A plugin that runs on the global scope that can effect the contents of a Datastar expression
export interface MacroPlugin extends DatastarPlugin {
  type: PluginType.Macro;
  regexp: RegExp;
  replacer: (groups: RegexpGroups) => string;
}

export type MacrosPlugins = Record<string, MacroPlugin>;

export type ActionMethod = (ctx: AttributeContext, ...args: any[]) => any;

export interface ActionPlugin extends DatastarPlugin {
  type: PluginType.Action;
  method: ActionMethod;
}

export type ActionPlugins = Record<string, ActionPlugin>;

// A plugin that runs on the global scope of the DastaStar instance
export interface WatcherPlugin extends DatastarPlugin {
  type: PluginType.Watcher;
  onGlobalInit?: (ctx: InitContext) => void;
}

export type NestedValues = { [key: string]: NestedValues | any };
export type NestedSignal = { [key: string]: NestedSignal | Signal<any> };
