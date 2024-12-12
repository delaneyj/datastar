# Error: NoTargetsFound

No targets were found for a fragment with the ID or selector `{ selectorOrID }` in the `merge-fragments` SSE event . Each fragment must target an element that already exists in the DOM, via an ID or selector.

Example using an ID:

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