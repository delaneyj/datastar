# Error: ReplaceUrlKeyNotAllowed

A key was provided to the `data-replace-url` attribute. The `data-replace-url` attribute must _only_ have a value, representing an expression that evaluates to a URL to replace in the browser without reloading the page.

Example:

```html
<div data-replace-url="'?page=1'"></div>
```

See the docs on the [`data-replace-url`](https://data-star.dev/reference/plugins_backend#data-replace-url) attribute.