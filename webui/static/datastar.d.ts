export declare interface ActionArgs {
    el: Element;
    dataStack: NamespacedReactiveRecords;
    actions: ActionsMap;
    applyPlugins: (el: Element) => void;
}

export declare type ActionFn = (args: WithExpressionArgs) => Promise<void>;

export declare type ActionsMap = Record<string, ActionFn>;

export declare const addAllFragmentPlugins: () => void;

export declare function addAllIncludedPlugins(): void;

export declare function addBindDataPlugin(): void;

export declare const addDeletePlugin: () => void;

export declare function addFocusDataPlugin(): void;

export declare const addGetPlugin: () => void;

export declare function addIntersectsplugin(): void;

export declare function addOnDataPlugin(): void;

export declare const addPatchPlugin: () => void;

export declare const addPostPlugin: () => void;

export declare const addPutPlugin: () => void;

export declare function addRefDataPlugin(): void;

export declare function addShowDataPlugin(): void;

export declare function addSignalDataPlugin(): void;

export declare function addTeleportDataPlugin(): void;

export declare function addTextDataPlugin(): void;

export declare const BIND = "bind";

export declare function camelize(str: string): string;

declare function defaultEquality(a: any, b: any): boolean;

export declare const DELETE = "delete";

export declare const FOCUS = "focus";

export declare function functionEval(el: Element, dataStack: NamespacedReactiveRecords, actions: ActionsMap, str: string): unknown;

export declare function functionGenerator<T>(str: string): NamespacedReactiveRecordCallback<T>;

export declare const GET = "get";

export declare function injectMockFetch(routes: MockFetchRoutes): void;

export declare const INTERSECTS = "intersects";

export declare interface MockedResponse {
    html: string;
    status?: number;
    statusText?: string;
    headers?: Headers;
}

export declare interface MockFetchRoutes {
    [url: string]: {
        [method: string]: (req: Request) => Promise<MockedResponse>;
    };
}

export declare type Modifier = {
    label: string;
    args: string[];
};

export declare type NamespacedReactiveRecordCallback<T> = (el: Element, data: NamespacedReactiveRecords, actions: ActionsMap) => T;

export declare type NamespacedReactiveRecords = Record<string, ReactiveRecord>;

export declare const ON = "on";

export declare const PATCH = "patch";

export declare const POST = "post";

export declare const PUT = "put";

/** A reactive element contains a mutable value that can be observed by other reactive elements.
 *
 * The property can be modified externally by calling set().
 *
 * Reactive elements may also contain a 0-ary function body that produces a new value using
 * values from other reactive elements.
 *
 * Dependencies on other elements are captured dynamically as the 'reactive' function body executes.
 *
 * The reactive function is re-evaluated when any of its dependencies change, and the result is
 * cached.
 */
declare class Reactive<T> {
    readonly isEffect: boolean;
    private _value;
    private fn?;
    private observers;
    private sources;
    private state;
    cleanups: ((oldValue: T) => void)[];
    equals: typeof defaultEquality;
    constructor(fnOrValue: (() => T) | T, isEffect?: boolean);
    get value(): T;
    set value(v: T);
    get(): T;
    set(fnOrValue: T | (() => T)): void;
    private stale;
    /** run the computation fn, updating the cached value */
    private update;
    /** update() if dirty, or a parent turns out to be dirty. */
    private updateIfNecessary;
    private removeParentObservers;
}

export declare type ReactiveRecord = Record<string, Reactive<any>>;

export declare type Reactivity = {
    signal<T>(initialValue: T): Reactive<T>;
    computed<T>(fn: () => T): Reactive<T>;
    effect(fn: () => void): Reactive<void>;
    onCleanup(fn: () => void): void;
};

export declare const REF = "ref";

export declare const SHOW = "show";

export declare const SIGNAL = "signal";

export declare const TELEPORT = "teleport";

export declare const TEXT = "text";

export declare function walkDownDOM(el: Element | null, callback: (el: Element) => void): void;

/**
 * Walks up the DOM tree, starting from the given element, and calls the callback for each element.
 * @param el The element to start from.
 * @param callback The callback to call for each element.
 */
export declare function walkUpDOM(el: Element | null, callback: (el: Element) => void): void;

export declare type WithExpressionArgs = {
    name: string;
    expression: string;
    el: Element;
    dataStack: NamespacedReactiveRecords;
    reactivity: Reactivity;
    withMod(label: string): Modifier | undefined;
    hasMod(label: string): boolean;
    applyPlugins(el: Element): void;
    actions: ActionsMap;
};

export { }
