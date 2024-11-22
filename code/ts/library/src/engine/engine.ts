import { nodeHTMLorSVGElement } from "../utils/dom";
import { HTMLorSVGElement } from "../utils/types";
import { DeepSignal, deepSignal, DeepState } from "../vendored/deepsignal";
import { computed, effect, Signal, signal } from "../vendored/preact-core";
import { apply } from "../vendored/ts-merge-patch";
import { DATASTAR } from "./consts";

import {
    ERR_ALREADY_EXISTS,
    ERR_BAD_ARGS,
    ERR_METHOD_NOT_ALLOWED,
    ERR_NOT_ALLOWED,
    ERR_NOT_FOUND,
} from "./errors";
import {
    ActionPlugin,
    ActionPlugins,
    AttribtueExpressionFunction,
    AttributeContext,
    AttributePlugin,
    DatastarPlugin,
    InitContext,
    OnRemovalFn,
    PreprocessorPlugin,
    Reactivity,
    WatcherPlugin,
} from "./types";
import { VERSION } from "./version";

const isPreprocessorPlugin = (p: DatastarPlugin): p is PreprocessorPlugin =>
    p.pluginType === "preprocessor";
const isWatcherPlugin = (p: DatastarPlugin): p is WatcherPlugin =>
    p.pluginType === "watcher";
const isAttributePlugin = (p: DatastarPlugin): p is AttributePlugin =>
    p.pluginType === "attribute";
const isActionPlugin = (p: DatastarPlugin): p is ActionPlugin =>
    p.pluginType === "action";

export class Engine {
    plugins: AttributePlugin[] = [];
    store: DeepSignal<any> = deepSignal({});
    preprocessors = new Array<PreprocessorPlugin>();
    actions: ActionPlugins = {};
    watchers = new Array<WatcherPlugin>();
    refs: Record<string, HTMLElement> = {};
    reactivity: Reactivity = {
        signal,
        computed,
        effect,
    };
    parentID = "";
    missingIDNext = 0;
    removals = new Map<Element, { id: string; set: Set<OnRemovalFn> }>();
    mergeRemovals = new Array<OnRemovalFn>();

    get version() {
        return VERSION;
    }

    load(...pluginsToLoad: DatastarPlugin[]) {
        const allLoadedPlugins = new Set<DatastarPlugin>(this.plugins);

        pluginsToLoad.forEach((plugin) => {
            if (plugin.requiredPlugins) {
                for (
                    const requiredPluginType of plugin
                        .requiredPlugins
                ) {
                    if (
                        !allLoadedPlugins.has(requiredPluginType)
                    ) {
                        // requires other plugin to be loaded
                        throw ERR_NOT_ALLOWED;
                    }
                }
            }

            let globalInitializer: ((ctx: InitContext) => void) | undefined;
            if (isPreprocessorPlugin(plugin)) {
                if (this.preprocessors.includes(plugin)) {
                    throw ERR_ALREADY_EXISTS;
                }
                this.preprocessors.push(plugin);
            } else if (isWatcherPlugin(plugin)) {
                if (this.watchers.includes(plugin)) {
                    throw ERR_ALREADY_EXISTS;
                }
                this.watchers.push(plugin);
                globalInitializer = plugin.onGlobalInit;
            } else if (isActionPlugin(plugin)) {
                if (!!this.actions[plugin.name]) {
                    throw ERR_ALREADY_EXISTS;
                }
                this.actions[plugin.name] = plugin;
            } else if (isAttributePlugin(plugin)) {
                if (this.plugins.includes(plugin)) {
                    throw ERR_ALREADY_EXISTS;
                }
                this.plugins.push(plugin);
                globalInitializer = plugin.onGlobalInit;
            } else {
                throw ERR_NOT_FOUND;
            }

            if (globalInitializer) {
                globalInitializer({
                    store: () => this.store,
                    upsertSignal: this.upsertSignal
                        .bind(this),
                    mergeSignals: this.mergeSignals.bind(this),
                    removeSignals: this.removeSignals.bind(this),
                    actions: this.actions,
                    reactivity: this.reactivity,
                    applyPlugins: this.applyPlugins.bind(this),
                    cleanup: this.cleanup.bind(
                        this,
                    ),
                });
            }

            allLoadedPlugins.add(plugin);
        });

        this.applyPlugins(document.body);
    }

    private cleanup(element: Element) {
        const removalSet = this.removals.get(element);
        if (removalSet) {
            for (const removal of removalSet.set) {
                removal();
            }
            this.removals.delete(element);
        }
    }

    lastMarshalledStore = "";
    private mergeSignals<T extends object>(mergeSignals: T) {
        this.mergeRemovals.forEach((removal) => removal());
        this.mergeRemovals = this.mergeRemovals.slice(0);

        const revisedStore = apply(this.store.value, mergeSignals) as DeepState;
        this.store = deepSignal(revisedStore);

        const marshalledStore = JSON.stringify(this.store.value);
        if (marshalledStore === this.lastMarshalledStore) return;
    }

    private removeSignals(...keys: string[]) {
        const revisedStore = { ...this.store.value };
        let found = false;
        for (const key of keys) {
            const parts = key.split(".");
            let currentID = parts[0];
            let subStore = revisedStore;
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (!subStore[currentID]) {
                    subStore[currentID] = {};
                }
                subStore = subStore[currentID];
                currentID = part;
            }
            delete subStore[currentID];
            found = true;
        }
        if (!found) return;
        this.store = deepSignal(revisedStore);
        this.applyPlugins(document.body);
    }

    private upsertSignal<T>(path: string, value: T) {
        const parts = path.split(".");
        let subStore = this.store as any;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!subStore[part]) {
                subStore[part] = {};
            }
            subStore = subStore[part];
        }
        const last = parts[parts.length - 1];

        const current = subStore[last];
        if (!!current) return current;

        const signal = this.reactivity.signal(value);
        subStore[last] = signal;

        return signal;
    }

    private applyPlugins(rootElement: Element) {
        const appliedProcessors = new Set<PreprocessorPlugin>();

        this.plugins.forEach((p, pi) => {
            this.walkDownDOM(rootElement, (el) => {
                if (!pi) this.cleanup(el);

                for (const rawKey in el.dataset) {
                    const rawExpression = `${el.dataset[rawKey]}` || "";
                    let expression = rawExpression;

                    if (!rawKey.startsWith(p.name)) continue;

                    if (el.id.length === 0) {
                        el.id = `${DATASTAR}-${this.parentID}-${this
                            .missingIDNext++}`;
                    }

                    appliedProcessors.clear();

                    if (p.allowedTagRegexps) {
                        const lowerCaseTag = el.tagName.toLowerCase();
                        const allowed = [...p.allowedTagRegexps].some((r) =>
                            lowerCaseTag.match(r)
                        );
                        if (!allowed) {
                            throw ERR_NOT_ALLOWED;
                        }
                    }

                    let keyRaw = rawKey.slice(p.name.length);
                    let [key, ...modifiersWithArgsArr] = keyRaw.split(".");
                    if (p.mustHaveEmptyKey && key.length > 0) {
                        // must have empty key
                        throw ERR_BAD_ARGS;
                    }
                    if (p.mustNotEmptyKey && key.length === 0) {
                        // must have non-empty key
                        throw ERR_BAD_ARGS;
                    }
                    if (key.length) {
                        key = key[0].toLowerCase() + key.slice(1);
                    }

                    const modifiersArr = modifiersWithArgsArr.map((m) => {
                        const [label, ...args] = m.split("_");
                        return { label, args };
                    });
                    if (p.allowedModifiers) {
                        for (const modifier of modifiersArr) {
                            if (!p.allowedModifiers.has(modifier.label)) {
                                // modifier not allowed
                                throw ERR_NOT_ALLOWED;
                            }
                        }
                    }
                    const modifiers = new Map<string, string[]>();
                    for (const modifier of modifiersArr) {
                        modifiers.set(modifier.label, modifier.args);
                    }

                    if (p.mustHaveEmptyExpression && expression.length) {
                        // must have empty expression
                        throw ERR_BAD_ARGS;
                    }
                    if (p.mustNotEmptyExpression && !expression.length) {
                        // must have non-empty expression
                        throw ERR_BAD_ARGS;
                    }

                    const splitRegex = /;|\n/;

                    if (p.removeNewLines) {
                        expression = expression
                            .split("\n")
                            .map((p: string) => p.trim())
                            .join(" ");
                    }

                    const processors = [
                        ...(p.preprocessors?.pre || []),
                        ...this.preprocessors,
                        ...(p.preprocessors?.post || []),
                    ];
                    for (const processor of processors) {
                        if (appliedProcessors.has(processor)) continue;
                        appliedProcessors.add(processor);

                        const expressionParts = expression.split(splitRegex);
                        const revisedParts: string[] = [];

                        expressionParts.forEach((exp) => {
                            let revised = exp;
                            const matches = [
                                ...revised.matchAll(processor.regexp),
                            ];
                            if (matches.length) {
                                for (const match of matches) {
                                    if (!match.groups) continue;
                                    const { groups } = match;
                                    const { whole } = groups;
                                    revised = revised.replace(
                                        whole,
                                        processor.replacer(groups),
                                    );
                                }
                            }
                            revisedParts.push(revised);
                        });
                        // })

                        expression = revisedParts.join("; ");
                    }

                    const ctx: AttributeContext = {
                        store: () => this.store,
                        mergeSignals: this.mergeSignals.bind(this),
                        upsertSignal: this.upsertSignal
                            .bind(this),
                        removeSignals: this.removeSignals.bind(this),
                        applyPlugins: this.applyPlugins.bind(this),
                        cleanup: this.cleanup
                            .bind(this),
                        walkSignals: this.walkSignals.bind(this),
                        actions: this.actions,
                        reactivity: this.reactivity,
                        el,
                        rawKey,
                        key,
                        rawExpression,
                        expression,
                        expressionFn: () => {
                            throw ERR_METHOD_NOT_ALLOWED;
                        },
                        modifiers,
                    };

                    if (
                        !p.bypassExpressionFunctionCreation?.(ctx) &&
                        !p.mustHaveEmptyExpression && expression.length
                    ) {
                        const statements = expression
                            .split(splitRegex)
                            .map((s) => s.trim())
                            .filter((s) => s.length);
                        statements[statements.length - 1] = `return ${
                            statements[statements.length - 1]
                        }`;
                        const joined = statements.map((s) => `  ${s}`).join(
                            ";\n",
                        );
                        const fnContent = `
  try {
    const _datastarExpression = () => {
  ${joined}
    }
    const _datastarReturnVal = _datastarExpression()
    return _datastarReturnVal
  } catch (e) {
   const msg = \`
  Error evaluating Datastar expression:
  ${joined.replaceAll("`", "\\`")}

  Error: \${e.message}

  Check if the expression is valid before raising an issue.
  \`.trim()
   console.error(msg)
   debugger
  }
              `;

                        try {
                            const argumentNames = p.argumentNames || [];
                            const fn = new Function(
                                "ctx",
                                ...argumentNames,
                                fnContent,
                            ) as AttribtueExpressionFunction;
                            ctx.expressionFn = fn;
                        } catch (e) {
                            const err = new Error(`${e}\nwith\n${fnContent}`);
                            console.error(err);
                            debugger;
                        }
                    }

                    const removal = p.onLoad(ctx);
                    if (removal) {
                        if (!this.removals.has(el)) {
                            this.removals.set(el, {
                                id: el.id,
                                set: new Set(),
                            });
                        }
                        this.removals.get(el)!.set.add(removal);
                    }
                }
            });
        });
    }

    private walkSignalsStore(
        store: any,
        callback: (name: string, signal: Signal<any>) => void,
    ) {
        const keys = Object.keys(store);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = store[key];
            const isSignal = value instanceof Signal;
            const hasChildren = typeof value === "object" &&
                Object.keys(value).length > 0;

            if (isSignal) {
                callback(key, value);
                continue;
            }

            if (!hasChildren) continue;

            this.walkSignalsStore(value, callback);
        }
    }

    private walkSignals(callback: (name: string, signal: Signal<any>) => void) {
        this.walkSignalsStore(this.store, callback);
    }

    private walkDownDOM(
        element: Element | null,
        callback: (el: HTMLorSVGElement) => void,
        siblingOffset = 0,
    ) {
        if (!element) return;
        const el = nodeHTMLorSVGElement(element);
        if (!el) return;

        callback(el);

        siblingOffset = 0;
        element = element.firstElementChild;
        while (element) {
            this.walkDownDOM(element, callback, siblingOffset++);
            element = element.nextElementSibling;
        }
    }
}
