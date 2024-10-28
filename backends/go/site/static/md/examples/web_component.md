## Web Component

## Demo

<div data-store="{name: '', reversed: ''}" class="flex flex-col gap-4">
    <input data-model="name" class="flex items-center input input-bordered">
    <div class="alert h-16">
        <span data-text="$reversed"></span>
    </div>
    <reverse-component data-bind-name="$name" data-on-reverse="$reversed = event.detail.value"></reverse-component>
</div>
<script type="module" src="/static/js/web_component.js"></script>

### Explanation

This is an example of two-way binding with a web component that reverses a string. Normally, the web component would output the reversed value, but in this example, all it does is perform the logic and dispatch an event containing the result, which is then displayed.

```html
<div data-store="{name: '', reversed: ''}">
    <input data-model="name">
    <span data-text="$reversed"></span>
    <reverse-component
        data-bind-name="$name"
        data-on-reverse="$reversed = event.detail.value"
    ></reverse-component>
</div>
<script type="module" src="/static/js/web_component.js"></script>
```

The `name` attribute value is bound to the `$name` store value, and an event listener modifies the `$reversed` store value sent in the `reverse` event. 

The web component observes changes to the `name` attribute and responds by reversing the string and dispatching a `reverse` event containing the resulting value.

```js
class ReverseComponent extends HTMLElement {
    static get observedAttributes() {
        return ['name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const value = newValue.split('').reverse().join('');
        this.dispatchEvent(new CustomEvent('reverse', {detail: {value}}));
    }
}

customElements.define('reverse-component', ReverseComponent);
```

