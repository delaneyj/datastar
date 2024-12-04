# Error E2: No Targets Found

No targets were found for a fragment in the `merge-fragments` SSE event. Each fragment must have a target, either via an ID attribute or a `selector`.

Example using an ID attribute (an element with the ID must already exist in the DOM):

```
event: datastar-merge-fragments
data: fragments <div id="foo"></div>
```

Example using a selector:

```
event: datastar-merge-fragments
data: selector #foo
data: fragments <div></div>
```

See the docs on the [`datastar-merge-fragments`](https://data-star.dev/reference/plugins_backend#datastar-merge-fragments) event.