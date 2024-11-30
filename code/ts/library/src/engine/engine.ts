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
  plugins: AttributePlugin[] = [];
  private _signals = new SignalsRoot(this);
  macros = new Array<MacroPlugin>();
  actions: ActionPlugins = {};
  watchers = new Array<WatcherPlugin>();
  refs: Record<string, HTMLElement> = {};
  reactivity: Reactivity = { signal, computed, effect };
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
        const that = this;
        globalInitializer({
          get signals() {
            return that._signals;
          },
          // upsertSignal: this.upsertSignal.bind(this),
          // mergeSignals: this.mergeSignals.bind(this),
          // removeSignals: this.removeSignals.bind(this),
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
          const rawExpression = `${el.dataset[rawKey]}` || "";
          let expression = rawExpression;

          if (!rawKey.startsWith(p.name)) continue;

          if (!el.id.length) {
            el.id = consistentUniqID(el);
          }

          appliedMacros.clear();

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

          const macros = [
            ...(p.macros?.pre || []),
            ...this.macros,
            ...(p.macros?.post || []),
          ];
          for (const macro of macros) {
            if (appliedMacros.has(macro)) continue;
            appliedMacros.add(macro);

            const expressionParts = expression.split(splitRegex);
            const revisedParts: string[] = [];

            expressionParts.forEach((exp) => {
              let revised = exp;
              const matches = [...revised.matchAll(macro.regexp)];
              if (matches.length) {
                for (const match of matches) {
                  if (!match.groups) continue;
                  const { groups } = match;
                  const { whole } = groups;
                  revised = revised.replace(whole, macro.replacer(groups));
                }
              }
              revisedParts.push(revised);
            });
            // })

            expression = revisedParts.join("; ");
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
            rawExpression,
            expression,
            expressionFn: () => {
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
            statements[statements.length - 1] = `return ${
              statements[statements.length - 1]
            }`;
            const j = statements.map((s) => `  ${s}`).join(";\n");
            const fnContent = `
try{
  ${j}
}catch(e){
  console.error(\`Error evaluating Datastar expression:
  ${j.replaceAll("`", "\\`")}

  Error: \${e.message}\n\nCheck if the expression is valid before raising an issue.\`.trim());
  debugger;
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

  private walkDownDOM(
    element: Element | null,
    callback: (el: HTMLorSVGElement) => void,
    siblingOffset = 0,
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
