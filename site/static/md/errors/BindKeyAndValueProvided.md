# Error: BindKeyAndValueProvided

Both a key and a value were provided to the `data-bind` attribute. The `data-bind` attribute must have either a key _or_ a value, representing the signal name to create and enable two-way binding with the element’s value.

Example:

```html
<input data-bind-signalname/>
```

See the docs on the [`data-bind`](https://data-star.dev/reference/plugins_dom#bind) attribute.