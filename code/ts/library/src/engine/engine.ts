import { consistentUniqID } from "../utils/dom";
import { DeepSignal, deepSignal, DeepState } from "../vendored/deepsignal";
import { computed, effect, Signal, signal } from "../vendored/preact-core";
import { apply } from "../vendored/ts-merge-patch";
import { PluginType } from "./enums";

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
  HTMLorSVGElement,
  InitContext,
  MacroPlugin,
  OnRemovalFn,
  Reactivity,
  WatcherPlugin,
} from "./types";
import { VERSION } from "./version";

const isMacroPlugin = (p: DatastarPlugin): p is MacroPlugin =>
  p.pluginType === PluginType.Macro;
const isWatcherPlugin = (p: DatastarPlugin): p is WatcherPlugin =>
  p.pluginType === PluginType.Watcher;
const isAttributePlugin = (p: DatastarPlugin): p is AttributePlugin =>
  p.pluginType === PluginType.Attribute;
const isActionPlugin = (p: DatastarPlugin): p is ActionPlugin =>
  p.pluginType === PluginType.Action;

export * from "./enums";

export class Engine {
  plugins: AttributePlugin[] = [];
  signals: DeepSignal<any> = deepSignal({});
  macros = new Array<MacroPlugin>();
  actions: ActionPlugins = {};
  watchers = new Array<WatcherPlugin>();
  refs: Record<string, HTMLElement> = {};
  reactivity: Reactivity = {
    signal,
    computed,
    effect,
  };
  removals = new Map<Element, { id: string; set: Set<OnRemovalFn> }>();
  mergeRemovals = new Array<OnRemovalFn>();

  get version() {
    return VERSION;
  }

  load(...pluginsToLoad: DatastarPlugin[]) {
    const allLoadedPlugins = new Set<DatastarPlugin>(this.plugins);

    pluginsToLoad.forEach((plugin) => {
      if (plugin.requiredPlugins) {
        for (const requiredPluginType of plugin.requiredPlugins) {
          if (!allLoadedPlugins.has(requiredPluginType)) {
            // REQ_PLUGIN_NOT_LOADED – The `{plugin}` plugin requires the `{requiredPluginType}` plugin to be loaded first.
            throw ERR_NOT_ALLOWED;
          }
        }
      }

      let globalInitializer: ((ctx: InitContext) => void) | undefined;
      if (isMacroPlugin(plugin)) {
        if (this.macros.includes(plugin)) {
          // PLUGIN_ALREADY_LOADED – The `{plugin}` plugin is already loaded.
          throw ERR_ALREADY_EXISTS;
        }
        this.macros.push(plugin);
      } else if (isWatcherPlugin(plugin)) {
        if (this.watchers.includes(plugin)) {
          // PLUGIN_ALREADY_LOADED – The `{plugin}` plugin is already loaded.
          throw ERR_ALREADY_EXISTS;
        }
        this.watchers.push(plugin);
        globalInitializer = plugin.onGlobalInit;
      } else if (isActionPlugin(plugin)) {
        if (!!this.actions[plugin.name]) {
          // PLUGIN_ALREADY_LOADED – The `{plugin}` plugin is already loaded.
          throw ERR_ALREADY_EXISTS;
        }
        this.actions[plugin.name] = plugin;
      } else if (isAttributePlugin(plugin)) {
        if (this.plugins.includes(plugin)) {
          // PLUGIN_ALREADY_LOADED – The `{plugin}` plugin is already loaded.
          throw ERR_ALREADY_EXISTS;
        }
        this.plugins.push(plugin);
        globalInitializer = plugin.onGlobalInit;
      } else {
        // INV_PLUGIN_TYPE – The `{plugin}` plugin type is invalid.
        throw ERR_NOT_FOUND;
      }

      if (globalInitializer) {
        globalInitializer({
          signals: () => this.signals,
          upsertSignal: this.upsertSignal.bind(this),
          mergeSignals: this.mergeSignals.bind(this),
          removeSignals: this.removeSignals.bind(this),
          actions: this.actions,
          reactivity: this.reactivity,
          applyPlugins: this.applyPlugins.bind(this),
          cleanup: this.cleanup.bind(this),
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

  lastMarshalledSignals = "";
  private mergeSignals<T extends object>(mergeSignals: T) {
    this.mergeRemovals.forEach((removal) => removal());
    this.mergeRemovals = this.mergeRemovals.slice(0);

    const revisedSignals = apply(this.signals.value, mergeSignals) as DeepState;
    this.signals = deepSignal(revisedSignals);

    const marshalledSignals = JSON.stringify(this.signals.value);
    if (marshalledSignals === this.lastMarshalledSignals) return;
  }

  private removeSignals(...keys: string[]) {
    const revisedSignals = { ...this.signals.value };
    let found = false;
    for (const key of keys) {
      const parts = key.split(".");
      let currentID = parts[0];
      let subSignals = revisedSignals;
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (!subSignals[currentID]) {
          subSignals[currentID] = {};
        }
        subSignals = subSignals[currentID];
        currentID = part;
      }
      delete subSignals[currentID];
      found = true;
    }
    if (!found) return;
    this.signals = deepSignal(revisedSignals);
    this.applyPlugins(document.body);
  }

  private upsertSignal<T>(path: string, value: T) {
    const parts = path.split(".");
    let subSignals = this.signals as any;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!subSignals[part]) {
        subSignals[part] = {};
      }
      subSignals = subSignals[part];
    }
    const last = parts[parts.length - 1];

    const current = subSignals[last];
    if (!!current) return current;

    const signal = this.reactivity.signal(value);
    subSignals[last] = signal;

    return signal;
  }

  private applyPlugins(rootElement: Element) {
    const appliedProcessors = new Set<MacroPlugin>();

    this.plugins.forEach((p, pi) => {
      this.walkDownDOM(rootElement, (el) => {
        if (!pi) this.cleanup(el);

        for (const rawKey in el.dataset) {
          const rawExpression = `${el.dataset[rawKey]}` || "";
          let expression = rawExpression;

          if (!rawKey.startsWith(p.name)) continue;

          if (!el.id.length) {
            el.id = consistentUniqID(el);
          }

          appliedProcessors.clear();

          if (p.allowedTagRegexps) {
            const lowerCaseTag = el.tagName.toLowerCase();
            const allowed = [...p.allowedTagRegexps].some((r) =>
              lowerCaseTag.match(r)
            );
            if (!allowed) {
              // TAG_NOT_ALLOWED – The `{lowerCaseTag}` tag is not allowed.
              throw ERR_NOT_ALLOWED;
            }
          }

          let keyRaw = rawKey.slice(p.name.length);
          let [key, ...modifiersWithArgsArr] = keyRaw.split(".");
          if (p.mustHaveEmptyKey && key.length > 0) {
            // MUST_EMPTY_KEY – The key must be empty. The `{plugin}` plugin does not support keys.
            throw ERR_BAD_ARGS;
          }
          if (p.mustNotEmptyKey && key.length === 0) {
            // MUST_NON_EMPTY_KEY – The key must not be empty. The `{plugin}` plugin requires a key.
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
                // MOD_NOT_ALLOWED – The `{modifier}` modifier is not allowed by the `{plugin}` plugin.
                throw ERR_NOT_ALLOWED;
              }
            }
          }
          const modifiers = new Map<string, string[]>();
          for (const modifier of modifiersArr) {
            modifiers.set(modifier.label, modifier.args);
          }

          if (p.mustHaveEmptyExpression && expression.length) {
            // MUST_EMPTY_EXP – The expression must be empty. The `{plugin}` plugin does not support expressions.
            throw ERR_BAD_ARGS;
          }
          if (p.mustNotEmptyExpression && !expression.length) {
            // MUST_NON_EMPTY_EXP – The expression must not be empty. The `{plugin}` plugin requires an expression.
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
            ...(p.macros?.pre || []),
            ...this.macros,
            ...(p.macros?.post || []),
          ];
          for (const processor of processors) {
            if (appliedProcessors.has(processor)) continue;
            appliedProcessors.add(processor);

            const expressionParts = expression.split(splitRegex);
            const revisedParts: string[] = [];

            expressionParts.forEach((exp) => {
              let revised = exp;
              const matches = [...revised.matchAll(processor.regexp)];
              if (matches.length) {
                for (const match of matches) {
                  if (!match.groups) continue;
                  const { groups } = match;
                  const { whole } = groups;
                  revised = revised.replace(whole, processor.replacer(groups));
                }
              }
              revisedParts.push(revised);
            });
            // })

            expression = revisedParts.join("; ");
          }

          const ctx: AttributeContext = {
            signals: () => this.signals,
            mergeSignals: this.mergeSignals.bind(this),
            upsertSignal: this.upsertSignal.bind(this),
            removeSignals: this.removeSignals.bind(this),
            applyPlugins: this.applyPlugins.bind(this),
            cleanup: this.cleanup.bind(this),
            walkSignals: this.walkMySignals.bind(this),
            actions: this.actions,
            reactivity: this.reactivity,
            el,
            rawKey,
            key,
            rawExpression,
            expression,
            expressionFn: () => {
              // MUST_EMPTY_EXP – No expression function was provided. The `{plugin}` plugin requires an expression function.
              throw ERR_METHOD_NOT_ALLOWED;
            },
            modifiers,
          };

          if (
            !p.bypassExpressionFunctionCreation?.(ctx) &&
            !p.mustHaveEmptyExpression &&
            expression.length
          ) {
            const statements = expression
              .split(splitRegex)
              .map((s) => s.trim())
              .filter((s) => s.length);
            statements[statements.length - 1] = `return ${statements[statements.length - 1]
              }`;
            const j = statements.map((s) => `  ${s}`).join(";\n");
            const fnContent = `try{${j}}catch(e){console.error(\`Error evaluating Datastar expression:\n${j.replaceAll(
              "`",
              "\\`"
            )}\n\nError: \${e.message}\n\nCheck if the expression is valid before raising an issue.\`.trim());debugger}`;
            try {
              const argumentNames = p.argumentNames || [];
              const fn = new Function(
                "ctx",
                ...argumentNames,
                fnContent
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

  private walkSignals(
    signals: any,
    callback: (name: string, signal: Signal<any>) => void
  ) {
    const keys = Object.keys(signals);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = signals[key];
      const isSignal = value instanceof Signal;
      const hasChildren =
        typeof value === "object" && Object.keys(value).length > 0;

      if (isSignal) {
        callback(key, value);
        continue;
      }

      if (!hasChildren) continue;

      this.walkSignals(value, callback);
    }
  }

  private walkMySignals(callback: (name: string, signal: Signal<any>) => void) {
    this.walkSignals(this.signals, callback);
  }

  private walkDownDOM(
    element: Element | null,
    callback: (el: HTMLorSVGElement) => void,
    siblingOffset = 0
  ) {
    if (
      !element ||
      !(element instanceof HTMLElement || element instanceof SVGElement)
    )
      return null;

    callback(element);

    siblingOffset = 0;
    element = element.firstElementChild;
    while (element) {
      this.walkDownDOM(element, callback, siblingOffset++);
      element = element.nextElementSibling;
    }
  }
}
