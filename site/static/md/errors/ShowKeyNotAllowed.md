# Error: ShowKeyNotAllowed

A key was provided to the `data-show` attribute. The `data-show` attribute must _only_ have a value, representing an expression evaluating to `true` or `false`, which determines whether to show or hide the element, respectively.

Example:

```html
<div data-show="foo.value"></div>
```

See the docs on the [`data-show`](https://data-star.dev/reference/plugins_browser#show) attribute.