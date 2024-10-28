import {
  DatastarEvent,
  apply,
  datastarEventName,
  remoteSignals,
} from "@sudodevnull/datastar";
import { diffJson, diffLines } from "diff";
import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { rehype } from "rehype";
import rehypeFormat from "rehype-format";
import styles from "./tailwind.css";
import { sendDatastarInspectorEvent } from "./utils.ts";
import {query} from 'lit/decorators/query.js';

interface VersionedStore {
  time: Date;
  contents: Record<string, any>;
  expressions: HTMLElement[];
}

type EventDetail = CustomEvent<DatastarEvent>["detail"];

function elementToStr(element: HTMLElement): string {
  const elementCloned = element.cloneNode(true) as HTMLElement;
  elementCloned.innerHTML = "";
  return element.outerHTML;
}

const highlightClass = "datastar-inspector-highlight";

function highlightElement(elementId: string): void {
  sendDatastarInspectorEvent(
    "highlight_element",
    `return document.getElementById('${elementId}')?.classList.add('${highlightClass}')`,
  );
}

function highlightElementStop(elementId: string): void {
  sendDatastarInspectorEvent(
    "highlight_element_stop",
    `return document.getElementById('${elementId}')?.classList.length === 1 ? document.getElementById('${elementId}').removeAttribute('class') : document.getElementById('${elementId}')?.classList.remove('${highlightClass}') `,
  );
}

function getRoot(
  document: Document,
  rootElementId: `#${string}` | undefined,
): HTMLElement {
  if (rootElementId) {
    const root = document.getElementById(rootElementId);
    if (root) return root;
    console.warn(
      `Inspector could not find root element with id ${rootElementId}`,
    );
    return document.documentElement;
  } else {
    return document.documentElement;
  }
}

const parser = new DOMParser();

@customElement("datastar-inspector")
export class DatastarInspectorElement extends LitElement {
  static styles = [styles];
  static maxEventOptions = [10, 50, 100, 500, 1000];

  @property()
  v = 0;

  @property()
  maxEvents = 10;

  @property()
  maxVersions = 10;

  @property()
  remoteOnly = false;

  @property()
  showPlugins = false;

  @property()
  rootElementId?: `#${string}` = undefined;

  versionOffset = 0;

  @query('#inspectorModal')
  _modal;

  @state()
  stores: VersionedStore[] = [
    {
      contents: {},
      time: new Date(),
      expressions: [],
    },
  ];

  @state()
  currentDom: Document = parser.parseFromString("<html></html>", "text/html");

  @state()
  events: Record<string, any>[] = [];

  @state()
  prevStoreMarshalled = "{}";

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    const winAny = window as any;
    winAny.addEventListener(
      datastarEventName,
      (evt: CustomEvent<DatastarEvent>) => {
        listener(evt.detail);
      },
    );

    const listener = async (detail: EventDetail) => {
      if (detail.subcategory === "backend" && detail.type === "merge") {
        const parsedMsg = JSON.parse(detail.message) as {
          fragment: string;
          useViewTransition: boolean;
          settleTime: number;
        };
        const message = String(
          await rehype()
            .use(rehypeFormat)
            .data("settings", { fragment: true })
            .process(parsedMsg.fragment),
        );

        this.events = [
          ...this.events,
          { ...detail, message: html`<pre>${message}</pre>` },
        ].slice(-this.maxEvents);
        return;
      }

      if (
        detail.subcategory === "backend" &&
        (detail.type === "fetch_start" || detail.type === "fetch_end")
      ) {
        const { method, urlExpression } = JSON.parse(detail.message) as {
          method: string;
          urlExpression: boolean;
        };
        const message = `${method} ${urlExpression}`;

        this.events = [...this.events, { ...detail, message }].slice(
          -this.maxEvents,
        );
        return;
      }
      if (detail.subcategory === "dom") {
        const currentDom = this.currentDom;
        const doc = parser.parseFromString(detail.message, "text/html");

        const newDom = doc;
        [...newDom.getElementsByTagName("datastar-inspector")].forEach((el) => {
          el.parentNode?.removeChild(el);
        });
        function removeClass(className: string) {
          newDom.querySelectorAll(`.${className}`).forEach((node) => {
            node.classList.remove(className);
            if (node.classList.length === 0) node.removeAttribute("class");
          });
        }
        [highlightClass, "datastar-swapping", "datastar-settling"].forEach(
          removeClass,
        );

        const currentExpressions =
          this.stores[this.stores.length - 1].expressions;

        const expressions: HTMLElement[] = [
          ...newDom.querySelectorAll("*"),
        ].filter((el: Element): el is HTMLElement => {
          if (!(el instanceof HTMLElement)) return false;
          return Object.keys({ ...el.dataset }).length > 0;
        });
        this.currentDom = newDom;

        if (
          currentDom.documentElement.outerHTML !==
          parser.parseFromString("<html></html>", "text/html").documentElement
            .outerHTML
        ) {
          const diff = diffLines(
            getRoot(currentDom, this.rootElementId).outerHTML,
            getRoot(newDom, this.rootElementId).outerHTML,
          );

          const diffMessage = (
            await Promise.all(
              diff
                .filter((d) => d.added || d.removed)
                .map(async (d) => {
                  const newValue = String(
                    await rehype()
                      .use(rehypeFormat)
                      .data("settings", { fragment: true })
                      .process(d.value),
                  );
                  return { ...d, value: newValue };
                }),
            )
          ).reduce(
            (acc, curr) => {
              const change = curr.added
                ? "color: oklch(var(--suc)); background-color: oklch(var(--su)); padding: 0.5rem;"
                : curr.removed
                  ? "color: oklch(var(--erc)); background-color: oklch(var(--er)); padding: 0.5rem;"
                  : "";
              acc.push(
                html`<div style="${change};">
                  <pre style="display: inline-block; width: 50vw;">
                    ${curr.value}
                  </pre
                  >
                </div>`,
              );
              return acc;
            },
            [] as ReturnType<typeof html>[],
          );

          if (diffMessage.length === 0) return;

          this.events = [...this.events, { ...detail, message: diffMessage }];
        }

        const changeInExpression =
          expressions.length !== currentExpressions.length ||
          !expressions.every((v, i) => v.isEqualNode(currentExpressions[i]));

        if (changeInExpression) {
          this.stores = [
            ...this.stores,
            {
              contents: this.stores[this.stores.length - 1].contents,
              time: new Date(),
              expressions,
            },
          ];
          if (this.stores.length > this.maxVersions) {
            this.versionOffset += this.stores.length - this.maxVersions;
            this.stores = this.stores.slice(-this.maxVersions);
          }
        }

        return;
      }
      if (
        detail.category === "core" &&
        detail.subcategory === "store" &&
        detail.type === "merged"
      ) {
        // merge events are special
        //const { message, target } = detail;
        const { message } = detail;
        let patch;
        const currentStore = this.stores[this.stores.length - 1].contents;
        const newStore = patch
          ? apply(currentStore, patch)
          : JSON.parse(message);

        const diff = diffJson(currentStore, newStore);

        const diffMessage = diff
          .filter((d) => d.added || d.removed)
          .reduce(
            (acc, curr) => {
              const change = curr.added
                ? "color: oklch(var(--suc)); background-color: oklch(var(--su)); padding: 0.5rem;"
                : curr.removed
                  ? "color: oklch(var(--erc)); background-color: oklch(var(--er)); padding: 0.5rem;"
                  : "";
              const symbol = curr.added ? " + " : curr.removed ? " - " : " ";
              acc.push(
                html`<span style="${change}">${symbol}${curr.value}</span>`,
              );
              return acc;
            },
            [] as ReturnType<typeof html>[],
          );

        if (!diffMessage) return;

        this.v = this.stores.length;
        this.stores = [
          ...this.stores,
          {
            contents: newStore,
            time: new Date(),
            expressions: this.stores[this.stores.length - 1].expressions,
          },
        ];
        if (this.stores.length > this.maxVersions) {
          this.versionOffset += this.stores.length - this.maxVersions;
          this.stores = this.stores.slice(-this.maxVersions);
        }

        this.events = [
          ...this.events,
          { ...detail, message: diffMessage },
        ].slice(-this.maxEvents);
        return;
      }
      this.events = [...this.events, detail].slice(-this.maxEvents);
    };
  }

  public render() {
    let storeDOM;

    if (this.v < 0 && this.v >= this.stores.length) {
      storeDOM = html` <div class="alert alert-warning">No store yet</div> `;
    } else {
      const currentStore = this.stores[this.v];
      let contents = Object.assign({}, currentStore?.contents);
      let expressions = currentStore?.expressions || [];

      if (this.remoteOnly) {
        contents = remoteSignals(contents);
      }

      if (!this.showPlugins) {
        delete (contents as any)["_dsPlugins"];
      }

      function listRefsTo(key: string) {
        return expressions
          .filter((el) => {
            return !!Object.keys(el.dataset)
              .map((data) => el.dataset[data])
              .find((val) => {
                return val?.includes(`\$${key}`) || val === `${key}`;
              });
          })
          .map((el) => {
            return html`<pre
              @mouseover="${() => highlightElement(el.id)}"
              @mouseout="${() => highlightElementStop(el.id)}"
            >
    ${elementToStr(el)}</pre
            >`;
          });
      }

      function listContents(state: typeof contents): ReturnType<typeof html>[] {
        return Object.keys(state).map((key) => {
          if (typeof state[key] === "object") {
            return html`<details class="collapse collapse-arrow">
              <summary class="collapse-title">${key}</summary>
              ${listContents(state[key])}
            </details>`;
          }
          const surround = typeof state[key] === "string" ? '"' : "";
          const fullKey = state[key].toString().length > 10 ? state[key] : "";
          const refs = listRefsTo(key);

          if (refs.length > 0) {
            return html`
              <details class="collapse collapse-arrow">
                <summary class="collapse-title bg-base-100">
                ${key} = ${surround}${state[key].toString().substring(0, 10)}${surround}
              </summary>
                <div class="collapse-content bg-base-300">
                    <pre>${fullKey}</pre>
                    Used by:</br>
                    ${refs}
                </div>
              </details>
            `;
          }

          return html`
            <summary>
              ${key} =
              ${surround}${state[key].toString().substring(0, 10)}${surround}
            </summary>
          `;
        });
      }

      storeDOM = html`
        <div class="card-title items-center justify-between">
          <div>Store</div>
          <div class="flex items-center gap-4">
            <div class="form-control">
              <label class="label cursor-pointer gap-2">
                <span class="label-text">Show plugin signals</span>
                <input
                  type="checkbox"
                  class="toggle"
                  ?checked=${this.showPlugins}
                  @change=${(evt: Event) => {
                    const target: HTMLInputElement =
                      evt.target as HTMLInputElement;
                    this.showPlugins = target.checked;
                  }}
                />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer gap-2">
                <span class="label-text">Remote only</span>
                <input
                  type="checkbox"
                  class="toggle"
                  ?checked=${this.remoteOnly}
                  @change=${(evt: Event) => {
                    const target: HTMLInputElement =
                      evt.target as HTMLInputElement;
                    this.remoteOnly = target.checked;
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        ${listContents(contents)}
      `;
    }

    return html`
      <div data-theme="datastar">
      <button class="btn" @click="${() => this._modal.showModal()}">Inspector</button>
      <dialog class="modal" id="inspectorModal">
        <div class="modal-box w-full">
          <h1>
            Inspector
          </h1>
          <details class="bg-base-100 collapse  collapse-arrow" open>
            <summary class="collapse-title text-xl font-medium">Store</summary>
            <div class="collapse-content flex gap-4 max-h-[40vh]">
              <ul
                class="menu bg-base-200 w-48 rounded-box overflow-y-scroll flex-col flex-nowrap text-xs"
              >
                <div>Versions</div>
                ${this.stores.map(
                  (store, i) => html`
                    <li
                      class=${`flex gap-1 ${this.v === i ? "text-primary" : ""}`}
                      @click=${() => (this.v = i)}
                    >
                      <div>
                        <span>${i + 1 + this.versionOffset}</span>
                        <div class="font-bold">
                          ${store.time.toLocaleTimeString()}
                        </div>
                      </div>
                    </li>
                  `,
                )}
              </ul>
              <div class="card w-full bg-base-200 overflow-auto">
                <div class="card-body flex-1">${storeDOM}</div>
              </div>
            </div>
          </details>
          <details class="bg-base-100 collapse collapse-arrow " open>
            <summary class="collapse-title text-xl font-medium">
              <div class="flex gap-8 items-center">
                Events
                <select
                  class="select w-full max-w-xs"
                  @change=${(evt: Event) => {
                    const target: HTMLSelectElement =
                      evt.target as HTMLSelectElement;
                    const val = parseInt(target.value);
                    this.maxEvents = val;
                  }}
                >
                  ${DatastarInspectorElement.maxEventOptions.map(
                    (opt) => html`
                      <option value=${opt} ?selected=${this.maxEvents === opt}>
                        ${opt} max
                      </option>
                    `,
                  )}
                </select>
                <div class="form-control">
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click=${(_: Event) => {
                      this.events = [];
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </summary>
            <div class="collapse-content relative">
              <div class="overflow-auto">
                <table class="table table-zebra table-compact w-full">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Target</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.events.map((evt) => {
                      return html`
                        <tr class="text-xs">
                          <td class="font-mono opacity-50">
                            ${evt.time.toISOString().split("T")[1].slice(0, 12)}
                          </td>
                          <td>${evt.category}/${evt.subcategory}</td>
                          <td>${evt.type}</td>
                          <td
                            @mouseover="${() => highlightElement(evt.target)}"
                            @mouseout="${() =>
                              highlightElementStop(evt.target)}"
                          >
                            ${evt.target}
                          </td>
                          <td class="w-full overflow-x-auto">${evt.message}</td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </div>
          <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
      </dialog>
      </div>
    `;
  }
}
