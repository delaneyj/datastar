import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  DatastarEvent,
  datastarEventName,
  remoteSignals,
  apply,
} from "@sudodevnull/datastar";
import styles from "./tailwind.css";
import { diffJson, diffLines } from "diff";
import { rehype } from "rehype";
import rehypeFormat from "rehype-format";
import { sendDatastarInspectorEvent } from "./utils.ts";

interface VersionedStore {
  time: Date;
  dom: Document;
  contents: Record<string, any>;
}

type EventDetail = CustomEvent<DatastarEvent>["detail"];

function elementToStr(element: Element): string {
  const attributes = [...element.attributes].reduce((acc, curr) => {
    return acc.concat(` ${curr.nodeName}="${curr.nodeValue}"`);
  }, "");

  const closingTag = element.childNodes.length > 0 ? ">" : "/>";

  return `<${element.tagName.toLowerCase()}${attributes}${closingTag}`;
}

const highlightClass = "datastar-inspector-highlight";

function highlightElement(element: Element): void {
  sendDatastarInspectorEvent(
    "highlight_element",
    `return document.getElementById('${element.id}')?.classList.add('${highlightClass}')`,
  );
}

function highlightElementStop(element: Element): void {
  sendDatastarInspectorEvent(
    "highlight_element_stop",
    `return document.getElementById('${element.id}')?.classList.length === 1 ? document.getElementById('${element.id}').removeAttribute('class') : document.getElementById('${element.id}')?.classList.remove('${highlightClass}') `,
  );
}

function transformToDetails(
  doc: Document,
  element: Element,
  depth: number,
): ReturnType<typeof html> {
  if (element.childNodes.length > 0) {
    return html`
      <details class="collapse collapse-arrow" style="margin-left: ${depth}em">
        <summary
          class="collapse-title"
          @mouseover="${() => highlightElement(element)}"
          @mouseout="${() => highlightElementStop(element)}"
        >
          <pre>${elementToStr(element)}</pre>
        </summary>
        ${element.children.length > 0
          ? [...element.children].map((child) => {
              return transformToDetails(doc, child, depth + 0.2);
            })
          : html`<pre class="collapse-content" style="margin-left: ${depth}em">
${element.innerHTML}</pre
            >`}
      </details>
    `;
  }

  return html`<pre class="collapse-content" style="margin-left: ${depth}em">
${elementToStr(element)}</pre
  >`;
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
  maxEvents = 100;

  @property()
  remoteOnly = false;

  @property()
  showPlugins = false;

  @property()
  rootElementId?: `#${string}` = undefined;

  @state()
  stores: VersionedStore[] = [
    {
      contents: {},
      dom: parser.parseFromString("<html></html>", "text/html"),
      time: new Date(),
    },
  ];

  @state()
  events: Record<string, any>[] = [];

  @state()
  prevStoreMarshalled = "{}";

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    const listener = async (detail: EventDetail) => {
      console.log("inspector got event", detail);

      // most events can be logged as is
      if (
        !(
          detail.category === "core" &&
          detail.subcategory === "store" &&
          detail.type === "merged"
        ) &&
        !(detail.category === "core" && detail.subcategory === "dom")
      ) {
        this.events = [...this.events, detail].slice(-this.maxEvents);
        /*
        const currentExpressions = this.stores[this.stores.length - 1].expressions || {};
        // keep new attributes in mind
        if (detail.category === "core" && detail.subcategory === "attributes" && detail.type === "expr_construction") {
          const parsedMessage: { rawKey: string, rawExpression: string, result: string } = JSON.parse(detail.message);
          if (!currentExpressions[detail.target]) currentExpressions[detail.target] = []

          currentExpressions[detail.target].push(parsedMessage);

          this.stores[this.stores.length - 1].expressions = currentExpressions
        }
        // remove attributes related to deleted elements
        if (detail.category === "core" && detail.subcategory === "elements" && detail.type === "removal") {
          if (currentExpressions[detail.target]) {
            delete currentExpressions[detail.target]
            this.stores[this.stores.length - 1].expressions = currentExpressions
          }
        }

        // remove old attributes
        if (detail.type === "expr_removal") {
          if (currentExpressions[detail.target]) {
            currentExpressions[detail.target] = currentExpressions[detail.target].filter((expr: Expression) => {
              return expr.rawKey !== detail.message
            })
            if (currentExpressions[detail.target].length === 0) delete currentExpressions[detail.target]
            this.stores[this.stores.length - 1].expressions = currentExpressions
          }
        }*/
        return;
      }

      if (detail.subcategory === "dom") {
        const currentDom = this.stores[this.stores.length - 1].dom;

        const doc = parser.parseFromString(detail.message, "text/html");

        const newDom = doc;
        newDom.querySelectorAll(`.${highlightClass}`).forEach((node) => {
          console.log("test");
          node.classList.remove(highlightClass);
          if (node.classList.length === 0) node.removeAttribute("class");
        });

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
              ? "color: green"
              : curr.removed
                ? "color: red"
                : "";
            acc.push(
              html`<div style="${change};">
                <pre style="display: inline-block; width: 50vw;">
${curr.value}</pre
                >
              </div>`,
            );
            return acc;
          },
          [] as ReturnType<typeof html>[],
        );

        if (diffMessage.length === 0) return;

        this.v = this.stores.length;
        this.stores = [
          ...this.stores,
          {
            contents: this.stores[this.stores.length - 1].contents,
            dom: newDom,
            time: new Date(),
          },
        ];

        this.events = [
          ...this.events,
          { ...detail, message: diffMessage },
        ].slice(-this.maxEvents);

        return;
      }

      // merge events are special
      //const { message, target } = detail;
      const { message } = detail;
      let patch;
      /*
      // if the message only includes a part of the store we need to build a patch
    if (target !== 'STORE') {
      const parts = message.split('.')
      const last: Record<string, any> = {};
      last[parts[parts.length -1]] = JSON.parse(message);
      patch = parts.slice(0, -1).reduceRight((subStore, currKey) => {
        const top: Record<string, any> = {};
        return top[currKey] = subStore;
      }, last);
    }
*/
      const currentStore = this.stores[this.stores.length - 1].contents;
      const newStore = patch ? apply(currentStore, patch) : JSON.parse(message);

      const diff = diffJson(currentStore, newStore);

      const diffMessage = diff
        .filter((d) => d.added || d.removed)
        .reduce(
          (acc, curr) => {
            const change = curr.added
              ? "color: green"
              : curr.removed
                ? "color: red"
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
          dom: this.stores[this.stores.length - 1].dom,
          time: new Date(),
        },
      ];

      this.events = [...this.events, { ...detail, message: diffMessage }].slice(
        -this.maxEvents,
      );
    };

    const winAny = window as any;
    winAny.addEventListener(
      datastarEventName,
      (evt: CustomEvent<DatastarEvent>) => {
        listener(evt.detail);
      },
    );
  }

  public render() {
    let storeDOM;

    if (this.v < 0 && this.v >= this.stores.length) {
      storeDOM = html` <div class="alert alert-warning">No store yet</div> `;
    } else {
      const currentStore = this.stores[this.v];
      let contents = Object.assign({}, currentStore?.contents);
      let dom = currentStore?.dom || "";

      if (this.remoteOnly) {
        contents = remoteSignals(contents);
      }

      if (!this.showPlugins) {
        delete (contents as any)["_dsPlugins"];
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
            <div class="form-control">
              <button
                type="button"
                class="btn btn-primary"
                @click=${(_: Event) => {
                  this.stores = [
                    {
                      contents: {},
                      dom: parser.parseFromString("<html></html>", "text/html"),
                      time: new Date(),
                    },
                  ];
                  this.events = [];
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <code class="font-mono text-xs overflow-auto">
          <pre>${JSON.stringify(contents, null, 2)}</pre>
        </code>

        <div>
          ${transformToDetails(dom, getRoot(dom, this.rootElementId), 0.2)}
        </div>
      `;
    }

    return html`
      <div data-theme="dark">
        <details class="bg-base-100 collapse  collapse-arrow  select-none" open>
          <summary class="collapse-title text-xl font-medium">Store</summary>
          <div class="collapse-content flex gap-4 max-h-[40vh]">
            <ul
              class="menu bg-base-200 w-48 rounded-box overflow-y-scroll flex-col flex-nowrap"
            >
              <div>Versions</div>
              ${this.stores.map(
                (store, i) => html`
                  <li
                    class=${`flex gap-1 ${this.v === i ? "text-primary" : ""}`}
                    @click=${() => (this.v = i)}
                  >
                    <div>
                      ${i + 1} /
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
            </div>
          </summary>
          <div class="collapse-content">
            <table
              class="table table-zebra table-compact w-[100]vw overflow-x-auto"
            >
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
                    <tr>
                      <td class="font-mono">
                        ${evt.time.toISOString().split("T")[1].slice(0, 12)}
                      </td>
                      <td>${evt.category}/${evt.subcategory}</td>
                      <td>${evt.type}</td>
                      <td>${evt.target}</td>
                      <td class="w-full overflow-x-auto">${evt.message}</td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    `;
  }
}
