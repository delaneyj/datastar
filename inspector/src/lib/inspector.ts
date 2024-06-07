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
            <ul class="menu bg-base-200 w-56 rounded-box">
              <div>Versions</div>
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
              <li><a>Item 3</a></li>
            </ul>
            <div class="card flex-1 bg-base-100">
              <div class="card-body">
                <div class="card-title">Contents</div>
                <pre class="font-mono">Contents</pre>
              </div>
            </div>
          </div>
        </details>
        <details class="bg-base-200 collapse" open>
          <summary class="collapse-title text-xl font-medium">Events</summary>
          <div class="collapse-content">
            <p>content</p>
          </div>
        </details>
      </div>
    `;
  }
}
