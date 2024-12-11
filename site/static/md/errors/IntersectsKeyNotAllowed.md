# Error: IntersectsKeyNotAllowed

The key `{ key }` was provided to the `data-intersects` attribute. The `data-intersects` attribute must _only_ have a value, representing an expression to run when the element intersects with the viewport.

Example:

```html
<div data-intersects="console.log('I am intersecting!')"></div>
```

See the docs on the [`data-intersects`](https://data-star.dev/reference/plugins_browser#intersects) attribute.