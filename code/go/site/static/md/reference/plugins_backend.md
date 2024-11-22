# Backend Plugins

[Source](https://github.com/starfederation/datastar/blob/main/packages/library/src/lib/plugins/official/backend.ts)

A set of plugins that allow for the integration of any backend service that supports SSE with Datastar.

## Attribute Plugins

Request for data from the server via SSE and merge with the page.

## Action Plugins

### `$get`, `$post`, `$put`, `$patch`, `$delete`

```html
<div data-on-click="$get('/examples/click_to_edit/contact/1')"></div>
```

Makes an HTML_VERB request to the server and merges the response with the current DOM and store. The URL can be any valid URL but the response must be a Datastar formatted SSE event.

Every request will be sent with a `{datastar: *}` object containing the current store (except for store keys beginning with an underscore). When using `$get` the store will be sent as a query parameter, otherwise it will be sent as a JSON body.

## Datastar SSE Event

An example of a minimal valid response would be:

```go
event: datastar-merge-fragments
data: fragment <div id="foo">Hello!</div>
```

Additional `data` lines can be added to the response to override the default behavior.

<div class="alert alert-warning">
  <iconify-icon icon="material-symbols:warning-rounded"></iconify-icon>
  <p>
  You should almost never need these additional attributes below. They are only for special cases.
  The default is to use idiomorph to merge the fragment by using the top level id into the DOM.
  Unless you are adding to a list, this is almost always the right answer!
  </p>
</div>

### datastar-merge-fragments

| Key                                | Description                                                                                                             |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `data: selector #foo`              | Selects the target element of the `merge` process using a CSS selector.                                                 |
| `data: mergeMode morph`            | Merges the fragment using [Idiomorph](https://github.com/bigskysoftware/idiomorph). This is the default merge strategy. |
| `data: mergeMode inner`            | Replaces the target's innerHTML with the fragment.                                                                      |
| `data: mergeMode outer`            | Replaces the target's outerHTML with the fragment.                                                                      |
| `data: mergeMode prepend`          | Prepends the fragment to the target's children.                                                                         |
| `data: mergeMode append`           | Appends the fragment to the target's children.                                                                          |
| `data: mergeMode before`           | Inserts the fragment before the target as a sibling.                                                                    |
| `data: mergeMode after`            | Inserts the fragment after the target as a sibling.                                                                     |
| `data: mergeMode upsertAttributes` | Merges attributes from the fragment into the target – useful for updating a store.                                      |
| `data: settleDuration 1000`        | Settles the element after 1000ms, useful for transitions. Defaults to `300`.                                            |
| `data: useViewTransition true`     | Whether to use view transitions when merging into the DOM. Defaults to `false`.                                         |
| `data: fragments`                  | The HTML fragments to merge into the DOM.                                                                               |

### datastar-merge-signals

```go
event: datastar-merge-signals
data: onlyIfMissing false
data: signals {foo: 1234}
```

The `datastar-merge-signals` event is used to update the store with new values. The `onlyIfMissing` line determines whether to update the store with new values only if the key does not exist. The `signals` line should be a valid `data-store` attribute. This will get merged into the store.

### datastar-remove-fragments

```go
event: datastar-remove-fragments
data: selector #foo
```

The `datastar-remove-fragments` event is used to remove HTML fragments that match the provided selector from the DOM.

```go
event: datastar-remove-signals
data: paths foo.bar 1234 abc
```

The `datastar-remove-signals` event is used to remove signals that match the provided paths from the store.

### datastar-execute-script

```go
event: datastar-execute-script
data: autoRemove true
data: attributes type module
data: attributes defer true
data: script console.log('Hello, world!')
```

The `datastar-execute-script` event is used to execute JavaScript in the browser. The `autoRemove` line determines whether to remove the script after execution. Each `attributes` line adds an attribute (in the format `name value`) to the `script` element. Each `script` line contains JavaScript to be executed by the browser. 

## Attribute Plugins

### Fetch Indicator

```html
<svg id="foo">Spinner</svg>
<button
  data-on-click="$get('/examples/click_to_edit/contact/1')"
  data-fetch-indicator="#foo"
  data-bind-disabled="$isFetching('#foo')"
></button>
```

Show a spinner when the request is in flight. The `data-fetch-indicator` attribute should be a CSS selector to the element(s). When the attribute is present, the element will be hidden when requests are not in flight and shown when they are.

The `$isFetching` action returns a computed value that allows you to easily react to the state of the indicator.

### Replace URL

```html
<div
  data-replace-url="'?page=1'">
</div>
```

Replaces the URL in the browser without reloading the page. The value can be a relative or absolute URL, and is an evaluated expression.

```html
<div
  data-replace-url="`/page{$page}`">
</div>
```

### Headers

```html
<div
  data-header="{'x-csrf-token':'JImikTbsoCYQ9oGOcvugov0Awc5LbqFsZW6ObRCxuqFHDdPbuFyc4ksPVVa9+EB4Ag+VU6rpc680edNFswIRwg=='}">
</div>
```

Can be added anywhere on the page and will be included on SSE fetches.  In general, you should lean to Cookies unless your backend framework demand it.
