import { elUniqId } from "../utils/dom";
import { effect } from "../vendored/preact-core";
import { VERSION } from "./consts";
import { dsErr, ErrorCodes } from "./errors";
import { SignalsRoot } from "./nestedSignals";
import {
    ActionPlugin,
    ActionPlugins,
    AttributePlugin,
    DatastarPlugin,
    HTMLorSVGElement,
    InitContext,
    MacroPlugin,
    Modifiers,
    OnRemovalFn,
    PluginType,
    RuntimeContext,
    RuntimeExpressionFunction,
    WatcherPlugin,
} from "./types";

const isMacroPlugin = (p: DatastarPlugin): p is MacroPlugin =>
    p.type === PluginType.Macro;
const isWatcherPlugin = (p: DatastarPlugin): p is WatcherPlugin =>
    p.type === PluginType.Watcher;
const isAttributePlugin = (p: DatastarPlugin): p is AttributePlugin =>
    p.type === PluginType.Attribute;
const isActionPlugin = (p: DatastarPlugin): p is ActionPlugin =>
    p.type === PluginType.Action;

export class Engine {
    private _signals = new SignalsRoot();
    private plugins: AttributePlugin[] = [];
    private macros: MacroPlugin[] = [];
    private actions: ActionPlugins = {};
    private watchers: WatcherPlugin[] = [];
    private removals = new Map<
        Element,
        { id: string; set: Set<OnRemovalFn> }
    >();

    get version() {
        return VERSION;
    }

    public load(...pluginsToLoad: DatastarPlugin[]) {
        const allLoadedPlugins = new Set<DatastarPlugin>(this.plugins);

        pluginsToLoad.forEach((plugin) => {
            if (!!plugin.requires?.size) {
                for (const requiredPluginType of plugin?.requires) {
                    if (!allLoadedPlugins.has(requiredPluginType)) {
                        throw dsErr(ErrorCodes.RequiredPluginNotLoaded,);
                    }
                }
            }

            let globalInitializer: ((ctx: InitContext) => void) | undefined;
            if (isMacroPlugin(plugin)) {
                if (this.macros.includes(plugin)) {
                    throw dsErr(ErrorCodes.PluginAlreadyLoaded, { name: plugin.name });
                }
                this.macros.push(plugin);
            } else if (isWatcherPlugin(plugin)) {
                if (this.watchers.includes(plugin)) {
                    throw dsErr(ErrorCodes.PluginAlreadyLoaded, { name: plugin.name });
                }
                this.watchers.push(plugin);
                globalInitializer = plugin.onGlobalInit;
            } else if (isActionPlugin(plugin)) {
                if (!!this.actions[plugin.name]) {
                    throw dsErr(ErrorCodes.PluginAlreadyLoaded, { name: plugin.name });
                }
                this.actions[plugin.name] = plugin;
            } else if (isAttributePlugin(plugin)) {
                if (this.plugins.includes(plugin)) {
                    throw dsErr(ErrorCodes.PluginAlreadyLoaded, { name: plugin.name });
                }
                this.plugins.push(plugin);
                globalInitializer = plugin.onGlobalInit;
            } else {
                throw dsErr(ErrorCodes.InvalidPluginType, { name: plugin.name, type: plugin.type });
            }

            if (globalInitializer) {
                const that = this; // I hate javascript
                globalInitializer({
                    get signals() {
                        return that._signals;
                    },
                    effect: (cb: () => void): OnRemovalFn => effect(cb),
                    actions: this.actions,
                    apply: this.apply.bind(this),
                    cleanup: this.cleanup.bind(this),
                });
            }

            allLoadedPlugins.add(plugin);
        });

        this.apply(document.body);
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

    private apply(rootElement: Element) {
        const appliedMacros = new Set<MacroPlugin>();
        this.plugins.forEach((p, pi) => {
            this.walkDownDOM(rootElement, (el) => {
                if (!pi) this.cleanup(el);

                for (const rawKey in el.dataset) {
                    const rawValue = `${el.dataset[rawKey]}` || "";
                    let value = rawValue;

                    if (!rawKey.startsWith(p.name)) continue;

                    if (!el.id.length) {
                        el.id = elUniqId(el);
                    }

                    appliedMacros.clear();

                    const keyRaw = rawKey.slice(p.name.length);
                    let [key, ...modifiersWithArgsArr] = keyRaw.split(".");
                    if (key.length) {
                        key = key[0].toLowerCase() + key.slice(1);
                    }
                    const mods: Modifiers = new Map<string, Set<string>>();
                    modifiersWithArgsArr.forEach((m) => {
                        const [label, ...args] = m.split("_");
                        mods.set(label, new Set(args));
                    });

                    const macros = [
                        ...(p.macros?.pre || []),
                        ...this.macros,
                        ...(p.macros?.post || []),
                    ];
                    for (const macro of macros) {
                        if (appliedMacros.has(macro)) continue;
                        appliedMacros.add(macro);
                        value = macro.fn(value);
                    }

                    const {
                        actions,
                        apply,
                        cleanup,
                    } = this;
                    const that = this; // I hate javascript
                    const ctx: RuntimeContext = {
                        get signals() {
                            return that._signals;
                        },
                        effect: (cb: () => void): OnRemovalFn => effect(cb),
                        apply: apply.bind(this),
                        cleanup: cleanup.bind(this),
                        actions,
                        genRX: () => {
                            throw dsErr(ErrorCodes.GenRXFunctionNotImplemented, { name: p.name });
                        },
                        el,
                        rawKey,
                        rawValue,
                        key,
                        value,
                        mods,
                    };
                    ctx.genRX = () => {
                        return this.generateReactiveExpression(
                            ctx,
                            ...p.argNames || [],
                        );
                    };

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

                    if (!!p?.purge) {
                        delete el.dataset[rawKey];
                    }
                }
            });
        });
    }

    private generateReactiveExpression(
        ctx: RuntimeContext,
        ...argNames: string[]
    ): RuntimeExpressionFunction {
        const statements = ctx.value
            .split(/;|\n/)
            .map((s) => s.trim())
            .filter((s) => s.length);
        const lastIdx = statements.length - 1;
        const RETURN = "return";
        const last = statements[lastIdx];
        if (!last.startsWith(RETURN)) {
            statements[lastIdx] = `${RETURN} ${statements[lastIdx]};`;
        }
        const userExpression = statements.join(";\n");

        const fnCall = /(\w*)\(/gm;
        const matches = userExpression.matchAll(fnCall);
        const methodsCalled = new Set<string>();
        for (const match of matches) {
            methodsCalled.add(match[1]);
        }
        // Action names
        const an = Object.keys(this.actions).filter((i) =>
            methodsCalled.has(i)
        );
        // Action lines
        const al = an.map((a) => `const ${a} = ctx.actions.${a}.fn;`);
        const fnContent = `${al.join("\n")}\n${userExpression}`;

        // Add ctx to action calls
        let fnContentWithCtx = fnContent;
        an.forEach((a) => {
            fnContentWithCtx = fnContentWithCtx.replaceAll(
                a + "(",
                a + "(ctx,",
            );
        });

        try {
            const argumentNames = argNames || [];
            const fn = new Function("ctx", ...argumentNames, fnContentWithCtx);
            return (...args: any[]) => fn(ctx, ...args);
        } catch (error) {
            throw dsErr(ErrorCodes.GeneratingExpressionFailed, { error, fnContent });
        }
    }

    private walkDownDOM(
        element: Element | null,
        callback: (el: HTMLorSVGElement) => void,
    ) {
        if (
            !element ||
            !(element instanceof HTMLElement || element instanceof SVGElement)
        ) {
            return null;
        }

        callback(element);

        element = element.firstElementChild;
        while (element) {
            this.walkDownDOM(element, callback);
            element = element.nextElementSibling;
        }
    }
}
