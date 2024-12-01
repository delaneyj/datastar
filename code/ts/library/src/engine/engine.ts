import { consistentUniqID } from "../utils/dom";
import { computed, effect, signal } from "../vendored/preact-core";
import { PluginType } from "./enums";

import {
  ERR_ALREADY_EXISTS,
  ERR_BAD_ARGS,
  ERR_METHOD_NOT_ALLOWED,
  ERR_NOT_ALLOWED,
  ERR_NOT_FOUND,
} from "./errors";
import { SignalsRoot } from "./nestedSignals";
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
  p.type === PluginType.Macro;
const isWatcherPlugin = (p: DatastarPlugin): p is WatcherPlugin =>
  p.type === PluginType.Watcher;
const isAttributePlugin = (p: DatastarPlugin): p is AttributePlugin =>
  p.type === PluginType.Attribute;
const isActionPlugin = (p: DatastarPlugin): p is ActionPlugin =>
  p.type === PluginType.Action;

export class Engine {
  private _signals = new SignalsRoot(this);
  private plugins: AttributePlugin[] = [];
  private macros: MacroPlugin[] = [];
  private actions: ActionPlugins = {};
  private watchers: WatcherPlugin[] = [];
  private reactivity: Reactivity = { signal, computed, effect };
  private removals = new Map<Element, { id: string; set: Set<OnRemovalFn> }>();

  get version() {
    return VERSION;
  }

  load(...pluginsToLoad: DatastarPlugin[]) {
    const allLoadedPlugins = new Set<DatastarPlugin>(this.plugins);

    pluginsToLoad.forEach((plugin) => {
      if (plugin.requiredPlugins) {
        for (const requiredPluginType of plugin.requiredPlugins) {
          if (!allLoadedPlugins.has(requiredPluginType)) {
            // requires other plugin to be loaded
            throw ERR_NOT_ALLOWED;
          }
        }
      }

      let globalInitializer: ((ctx: InitContext) => void) | undefined;
      if (isMacroPlugin(plugin)) {
        if (this.macros.includes(plugin)) {
          throw ERR_ALREADY_EXISTS;
        }
        this.macros.push(plugin);
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
        const that = this; // I hate javascript
        globalInitializer({
          get signals() {
            return that._signals;
          },
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

  applyPlugins(rootElement: Element) {
    const appliedMacros = new Set<MacroPlugin>();

    this.plugins.forEach((p, pi) => {
      this.walkDownDOM(rootElement, (el) => {
        if (!pi) this.cleanup(el);

        for (const rawKey in el.dataset) {
          const rawValue = `${el.dataset[rawKey]}` || "";
          let valueRevised = rawValue;

          if (!rawKey.startsWith(p.name)) continue;

          if (!el.id.length) {
            el.id = consistentUniqID(el);
          }

          appliedMacros.clear();

          if (p.tags) {
            const lowerCaseTag = el.tagName.toLowerCase();
            const allowed = [...p.tags].some((r) => lowerCaseTag.match(r));
            if (!allowed) {
              throw ERR_NOT_ALLOWED;
            }
          }

          let keyRaw = rawKey.slice(p.name.length);
          let [key, ...modifiersWithArgsArr] = keyRaw.split(".");
          if (p.noKey && key.length > 0) {
            // must have empty key
            throw ERR_BAD_ARGS;
          }
          if (p.mustKey && key.length === 0) {
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
          if (p.onlyMods) {
            for (const modifier of modifiersArr) {
              if (!p.onlyMods.has(modifier.label)) {
                // modifier not allowed
                throw ERR_NOT_ALLOWED;
              }
            }
          }
          const mods = new Map<string, string[]>();
          for (const modifier of modifiersArr) {
            mods.set(modifier.label, modifier.args);
          }

          if (p.noVal && valueRevised.length) {
            // must have empty expression
            throw ERR_BAD_ARGS;
          }
          if (p.mustValue && !valueRevised.length) {
            // must have non-empty expression
            throw ERR_BAD_ARGS;
          }

          const splitRegex = /;|\n/;

          const macros = [
            ...(p.macros?.pre || []),
            ...this.macros,
            ...(p.macros?.post || []),
          ];
          for (const macro of macros) {
            if (appliedMacros.has(macro)) continue;
            appliedMacros.add(macro);

            const expressionParts = valueRevised.split(splitRegex);
            const revisedParts: string[] = [];

            expressionParts.forEach((exp) => {
              let revised = exp;
              const matches = [...revised.matchAll(macro.regexp)];
              if (matches.length) {
                for (const match of matches) {
                  if (!match.groups) continue;
                  const { groups } = match;
                  const { whole } = groups;
                  revised = revised.replace(whole, macro.alter(groups));
                }
              }
              revisedParts.push(revised);
            });

            valueRevised = revisedParts.join(";\n");
          }

          const that = this; // I hate javascript
          const ctx: AttributeContext = {
            get signals() {
              return that._signals;
            },
            applyPlugins: this.applyPlugins.bind(this),
            cleanup: this.cleanup.bind(this),
            actions: this.actions,
            reactivity: this.reactivity,
            el,
            rawKey,
            key,
            rawValue: rawValue,
            value: valueRevised,
            expr: () => {
              throw ERR_METHOD_NOT_ALLOWED;
            },
            mods: mods,
          };

          if (!p.noGenExpr?.(ctx) && !p.noVal && valueRevised.length) {
            const statements = valueRevised
              .split(splitRegex)
              .map((s) => s.trim())
              .filter((s) => s.length);
            statements[statements.length - 1] = `return ${
              statements[statements.length - 1]
            }`;
            const j = statements.map((s) => `  ${s}`).join(";\n");
            const fnContent = `try{${j}}catch(e){console.error(\`Error evaluating Datastar expression:\n${j.replaceAll(
              "`",
              "\\`"
            )}\n\nError: \${e.message}\n\nCheck if the expression is valid before raising an issue.\`.trim());\ndebugger\n}`;
            try {
              const argumentNames = p.argNames || [];
              const fn = new Function(
                "ctx",
                ...argumentNames,
                fnContent
              ) as AttribtueExpressionFunction;
              ctx.expr = fn;
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

  private walkDownDOM(
    element: Element | null,
    callback: (el: HTMLorSVGElement) => void,
    siblingOffset = 0
  ) {
    if (
      !element ||
      !(element instanceof HTMLElement || element instanceof SVGElement)
    ) {
      return null;
    }

    callback(element);

    siblingOffset = 0;
    element = element.firstElementChild;
    while (element) {
      this.walkDownDOM(element, callback, siblingOffset++);
      element = element.nextElementSibling;
    }
  }
}
