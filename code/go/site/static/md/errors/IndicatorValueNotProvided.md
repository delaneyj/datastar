# Error: IndicatorValueNotProvided

No value was provided to the `data-indicator` attribute. The `data-indicator` attribute must have a value, representing the name of a signal. The signal will be assigned the value `true` when an SSE request is in-flight, otherwise it will be `false`.

Example:

```html
<div data-indicator="signalName"></div>
```

See the docs on the [`data-indicator`](https://data-star.dev/reference/plugins_backend#data-indicator) attribute.