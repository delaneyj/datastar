# Error: AttributesValueRequired

No value was provided to the `data-attributes` attribute. The `data-attributes` attribute _must_ have a value, representing either an expression (if a key is provided), or an object of key-value pairs, where the keys are attribute names and the values are expressions.

Example:

```html
<div data-attributes-disabled="foo.value"></div>

<div data-attributes="{disabled: foo.value}"></div>
```

See the docs on the [`data-attributes`](/reference/attribute_plugins#data-attributes) attribute.