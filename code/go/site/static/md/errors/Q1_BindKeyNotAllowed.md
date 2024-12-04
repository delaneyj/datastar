# Error Q1: Bind Key Not Allowed

A key was provided to the `data-bind` attribute, which is not allowed. The `data-bind` value must be a string, representing the signal name to create and enable two-way binding with the element’s value.

Example:

```html
<input data-bind="signalName"/>
```

See the docs on the [`data-bind`](https://data-star.dev/reference/plugins_attributes#bind) attribute.