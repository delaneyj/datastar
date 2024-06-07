import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./tailwind.css";

@customElement("datastar-inspector")
export class DatastarInspectorElement extends LitElement {
  static styles = [styles];

  public render() {
    return html`
      <div data-theme="dark" class="p-4 rounded-xl flex flex-col gap-4">
        <h1 class="text-3xl font-bold uppercase">Datastar Inspector</h1>
        <details class="bg-base-200 collapse" open>
          <summary class="collapse-title text-xl font-medium">Store</summary>
          <div class="collapse-content flex gap-4">
            <ul class="menu bg-base-200 rounded-box">
              <div>Versions</div>
              <li>
                <div class="text-secondary">
                  1 /
                  <span class="font-bold">7:42</span>
                </div>
              </li>
              <li>
                <div class="text-secondary">
                  2 / <span class="font-bold">7:45</span>
                </div>
              </li>
              <li>
                <div class="text-secondary">
                  3 / <span class="font-bold">8:42</span>
                </div>
              </li>
            </ul>
            <div class="card flex-1 bg-base-100 h-full">
              <div class="card-body flex-1">
                <div class="card-title">Contents</div>
                <code class="font-mono text-xs overflow-auto">
                  Consequat sint duis pariatur tempor voluptate irure eu culpa
                  ullamco adipisicing. Eu excepteur ullamco consequat commodo.
                  Voluptate laboris laborum tempor duis velit proident dolore
                  esse duis.</code
                >
              </div>
            </div>
          </div>
        </details>
        <details class="bg-base-200 collapse" open>
          <summary class="collapse-title text-xl font-medium">Events</summary>
          <div class="collapse-content">
            <div class="skeleton w-full h-96"></div>
          </div>
        </details>
      </div>
    `;
  }
}
