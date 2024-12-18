# Error: SseFormNotFound

No form with the selector `{ form }` could be found in the DOM. When specifying a form selector using the `form` option in the `sse()` action, the form must already exist in the DOM.

Example:

```html
<button data-class-hidden="foo.value"></div>

<div data-class="{hidden: foo.value}"></div>
```

See the docs on the [`data-class`](/reference/attribute_plugins#data-class) attribute.