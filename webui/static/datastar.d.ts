export declare type Action = (ctx: AttributeContext, ...args: string[]) => Promise<void>;

export declare type Actions = Record<string, Action>;

declare type AtomicState = Array<unknown> | ((...args: unknown[]) => unknown) | string | boolean | number | bigint | symbol | undefined | null;

export declare type AttributeContext = {
    store: () => any;
    mergeStore: (store: DeepState) => void;
    applyPlugins: (target: Element) => void;
    walkSignals: (cb: (name: string, signal: Signal<any>) => void) => void;
    cleanupElementRemovals: (el: Element) => void;
    actions: Readonly<Actions>;
    refs: Record<string, HTMLorSVGElement>;
    reactivity: Reactivity;
    el: Readonly<HTMLorSVGElement>;
    key: Readonly<string>;
    expression: Readonly<string>;
    expressionFn: ExpressionFunction;
    modifiers: Map<string, string[]>;
    JSONStringify: <T>(value: T) => string;
    JSONParse: <T>(value: string) => T;
};

export declare type AttributePlugin = {
    prefix: string;
    requiredPluginPrefixes?: Iterable<string>;
    onGlobalInit?: (ctx: InitContext) => void;
    onLoad: (ctx: AttributeContext) => OnRemovalFn | void;
    allowedModifiers?: Set<string>;
    mustHaveEmptyExpression?: boolean;
    mustNotEmptyExpression?: boolean;
    mustHaveEmptyKey?: boolean;
    mustNotEmptyKey?: boolean;
    allowedTagRegexps?: Set<string>;
    disallowedTags?: Set<string>;
    preprocessors?: {
        pre?: Preprocesser[];
        post?: Preprocesser[];
    };
    bypassExpressionFunctionCreation?: (ctx: AttributeContext) => boolean;
};

declare function Computed(this: Computed, compute: () => unknown): void;

declare class Computed<T = any> extends Signal<T> {
    _compute: () => T;
    _sources?: Node_2;
    _globalVersion: number;
    _flags: number;
    constructor(compute: () => T);
    _notify(): void;
    get value(): T;
}

declare namespace Computed {
    var prototype: Computed<any>;
}

export declare class Datastar {
    plugins: AttributePlugin[];
    store: DeepSignal<any>;
    actions: Actions;
    refs: Record<string, HTMLElement>;
    reactivity: Reactivity;
    parentID: string;
    missingIDNext: number;
    removals: Map<Element, Set<OnRemovalFn>>;
    constructor(actions?: Actions, ...plugins: AttributePlugin[]);
    run(): void;
    JSONStringify<T>(data: T): string;
    JSONParse<T>(json: string): T;
    private cleanupElementRemovals;
    private mergeStore;
    signalByName<T>(name: string): Signal<T>;
    private applyPlugins;
    private walkSignalsStore;
    private walkSignals;
    private walkDownDOM;
}

export declare type DatastarPlugin = {};

declare class DeepSignal<T extends DeepState> implements DeepSignalAccessors<T> {
    get value(): ReadOnlyDeep<T>;
    set value(payload: ReadOnlyDeep<T>);
    peek(): ReadOnlyDeep<T>;
}

declare interface DeepSignalAccessors<T extends DeepState> {
    value: ReadOnlyDeep<T>;
    peek: () => ReadOnlyDeep<T>;
}

declare type DeepState = {
    [key: string]: (() => unknown) | AtomicState | DeepState;
};

declare function Effect(this: Effect, compute: () => unknown | EffectCleanup): void;

declare class Effect {
    _compute?: () => unknown | EffectCleanup;
    _cleanup?: () => unknown;
    _sources?: Node_2;
    _nextBatchedEffect?: Effect;
    _flags: number;
    constructor(compute: () => unknown | EffectCleanup);
    _callback(): void;
    _start(): () => void;
    _notify(): void;
    _dispose(): void;
}

declare type EffectCleanup = () => unknown;

export declare type ExpressionFunction = (ctx: AttributeContext) => any;

export declare type HTMLorSVGElement = Element & (HTMLElement | SVGElement);

declare const identifier: unique symbol;

export declare type InitContext = {
    store: any;
    mergeStore: (store: DeepState) => void;
    actions: Readonly<Actions>;
    refs: Record<string, HTMLorSVGElement>;
    reactivity: Reactivity;
};

declare type Node_2 = {
    _source: Signal;
    _prevSource?: Node_2;
    _nextSource?: Node_2;
    _target: Computed | Effect;
    _prevTarget?: Node_2;
    _nextTarget?: Node_2;
    _version: number;
    _rollbackNode?: Node_2;
};

export declare type OnRemovalFn = () => void;

export declare type Preprocesser = {
    regexp: RegExp;
    replacer: (groups: RegexpGroups) => string;
};

export declare type Reactivity = {
    signal: <T>(value: T) => Signal<T>;
    computed: <T>(fn: () => T) => ReadonlySignal<T>;
    effect: (cb: () => void) => OnRemovalFn;
};

declare type ReadOnlyDeep<T> = {
    readonly [P in keyof T]: ReadOnlyDeep<T[P]>;
};

declare interface ReadonlySignal<T = any> extends Signal<T> {
    readonly value: T;
}

export declare type RegexpGroups = Record<string, string>;

export declare function runDatastarWith(actions?: Actions, ...plugins: AttributePlugin[]): Datastar;

export declare function runDatastarWithAllPlugins(addedActions?: Actions, ...addedPlugins: AttributePlugin[]): Datastar;

/* Excluded declaration from this release type: Signal */

declare class Signal<T = any> {
    /* Excluded from this release type: _value */
    /* Excluded from this release type: _version */
    /* Excluded from this release type: _node */
    /* Excluded from this release type: _targets */
    constructor(value?: T);
    /* Excluded from this release type: _refresh */
    /* Excluded from this release type: _subscribe */
    /* Excluded from this release type: _unsubscribe */
    subscribe(fn: (value: T) => void): () => void;
    valueOf(): T;
    toString(): string;
    toJSON(): T;
    peek(): T;
    brand: typeof identifier;
    get value(): T;
    set value(value: T);
}

export declare function toHTMLorSVGElement(node: Node): HTMLorSVGElement | null;

export { }
