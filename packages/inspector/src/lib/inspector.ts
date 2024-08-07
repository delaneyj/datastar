import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import {
  DatastarEvent,
  datastarEventName,
  remoteSignals,
  apply
} from "@sudodevnull/datastar";
import styles from "./tailwind.css";
import { diffJson } from 'diff';

interface VersionedStore {
  time: Date;
  contents: Object;
}

type EventDetail = CustomEvent<DatastarEvent>['detail']

@customElement("datastar-inspector")
export class DatastarInspectorElement extends LitElement {
  static styles = [styles];
  static maxEventOptions = [5, 10, 20, 50];

  @property()
  v = 0;

  @property()
  maxEvents = 10;

  @property()
  remoteOnly = false;

  @property()
  showPlugins = false;

  @state()
  stores: VersionedStore[] = [{
            contents: {},
            time: new Date(),
          }];

  @state()
  events: Record<string, any>[] = [];

  @state()
  prevStoreMarshalled = "{}";

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    const listener = (detail: EventDetail) => {
      console.log('inspector got event', detail);

      // most events can be logged as is
      if (!(detail.category === "core" && detail.subcategory === "store" && detail.type === "merged")) {
        this.events = [...this.events, detail].slice(-this.maxEvents);
        return;
      }

      // merge events are special
      const { message, target } = detail;
      let patch;

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

      const currentStore = this.stores[this.stores.length - 1].contents;
      const newStore = patch ? apply(currentStore, patch) : JSON.parse(message);

      const diff = diffJson(currentStore, newStore);

      const diffMessage = diff.filter((d) => d.added || d.removed).reduce((acc, curr) => {
        const change = curr.added ? 'color: green' : curr.removed ? 'color: red' : '';
        const symbol = curr.added ? ' + ' : curr.removed ? ' - ' : ' ';
        return acc.concat(`<span style="${change}">${symbol}${curr.value}</span>`);
      }, "")

      if (!diffMessage) return;

        this.v = this.stores.length;
        this.stores = [
          ...this.stores,
          {
            contents: newStore,
            time: new Date(),
          },
        ];

        this.events = [...this.events, {...detail, message: diffMessage }].slice(-this.maxEvents);
   };

     const winAny = window as any;
     winAny.addEventListener(datastarEventName, (evt: CustomEvent<DatastarEvent>) => {

        listener(evt.detail);
     });
  }

  public render() {
    let storeDOM;

    if (this.v < 0 && this.v >= this.stores.length) {
      storeDOM = html` <div class="alert alert-warning">No store yet</div> `;
    } else {
      const currentStore = this.stores[this.v];
      let contents = Object.assign({}, currentStore?.contents);

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
          </div>
        </div>
        <code class="font-mono text-xs overflow-auto">
          <pre>${JSON.stringify(contents, null, 2)}</pre>
        </code>
      `;
    }

    return html`
      <div data-theme="dark">
            <details
              class="bg-base-100 collapse  collapse-arrow  select-none"
              open
            >
              <summary class="collapse-title text-xl font-medium">
                Store
              </summary>
              <div class="collapse-content flex gap-4 max-h-[40vh]">
                <ul class="menu bg-base-200 w-48 rounded-box overflow-y-scroll flex-col flex-nowrap">
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
                    `
                  )}
                </ul>
                <div class="card w-full bg-base-200 h-full">
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
                        <option
                          value=${opt}
                          ?selected=${this.maxEvents === opt}
                        >
                          ${opt} max
                        </option>
                      `
                    )}
                  </select>
                </div>
              </summary>
              <div class="collapse-content">
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
                    ${this.events.map(
                      (evt) => {
                      return html`
                        <tr>
                          <td class="font-mono">
                            ${evt.time.toISOString().split("T")[1].slice(0, 12)}
                          </td>
                          <td>${evt.category}/${evt.subcategory}</td>
                          <td>${evt.type}</td>
                          <td>${evt.target}</td>
                          <td class="w-full">${unsafeHTML(evt.message)}</td>
                        </tr>
                      `
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </details>
      </div>
    `;
  }
}
