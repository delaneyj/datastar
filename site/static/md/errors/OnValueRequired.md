# Error: OnValueRequired

No value was provided to the `data-on` attribute. The `data-on` attribute _must_ have a value, representing an expression to execute when the event listener is triggered.

Example:

```html
<button data-on-click="alert(foo.value)">Click Me</button>
```

See the docs on the [`data-on`](https://data-star.dev/reference/plugins_dom#on) attribute.