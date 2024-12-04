# Error: ComputedKeyNotProvided

No key was provided to the `data-computed` attribute. The `data-computed` attribute must have a key, representing the signal name to create.

Example:

```html
<div data-computed-blinker="count.value % 2 === 0"></div>
```

See the docs on the [`data-computed`](https://data-star.dev/reference/plugins_core#computed) attribute.