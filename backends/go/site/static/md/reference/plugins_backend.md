# Backend Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/packages/library/src/lib/plugins/backend.ts)

A set of plugins that allow for the integration of any backend service that supports SSE with Datastar.

## Attribute Plugins

Request for data from the server via SSE and merge with the page.

## Action Plugins

### `$$get`, `$$post`, `$$put`, `$$patch`, `$$delete`

```html
<div data-on-click="$$get('/examples/click_to_edit/contact/1')"></div>
```

Makes an HTML_VERB request to the server and merges the response with the current DOM and store. The URL can be any valid URL but the response must be a Datastar formatted SSE event.

Every request will be sent with a `{datastar: *}` object containing the current store (except for store keys beginning with an underscore). When using `$$get` the store will be sent as a query parameter, otherwise it will be sent as a JSON body.

## Datastar SSE Event

An example of a minimal valid response would be:

```go
event: datastar-fragment
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

### datastar-fragment

| Key                             | Description                                                                                                             |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `data: selector #foo`           | Selects the target element of the `merge` process using a CSS selector.                                                 |
| `data: selector self`           | Selects the initiating element as the target.                                                                           |
| `data: merge morph`             | Merges the fragment using [Idiomorph](https://github.com/bigskysoftware/idiomorph). This is the default merge strategy. |
| `data: merge inner`             | Replaces the target's innerHTML with the fragment.                                                                      |
| `data: merge outer`             | Replaces the target's outerHTML with the fragment.                                                                      |
| `data: merge prepend`           | Prepends the fragment to the target's children.                                                                         |
| `data: merge append`            | Appends the fragment to the target's children.                                                                          |
| `data: merge before`            | Inserts the fragment before the target as a sibling.                                                                    |
| `data: merge after`             | Inserts the fragment after the target as a sibling.                                                                     |
| `data: merge upsert_attributes` | Merges attributes from the fragment into the target – useful for updating a store.                                      |
| `data: settle 1000`             | Settles the element after 1000ms, useful for transitions. Defaults to `500`.                                            |
| `data: vt false`                | Turns off View-Transitions on Datastar messages. Defaults to `true`.                                                    |
| `data: fragment`                | The HTML fragment to merge into the DOM.                                                                                |

**Note:** `script` tags are not executed by the browser when merged into the DOM in this way. You should use signals and event listeners to instead.

### datastar-signal

```go
event: datastar-signal
data: onlyIfMissing false
data: store {foo: 1234}
```

The `datastar-signal` event is used to update the store with new values. The `onlyIfMissing` line determines whether to update the store with new values only if the key does not exist. The `store` line should be a valid `data-store` attribute. This will get merged into the store.

### datastar-delete

```go
event: datastar-delete
data: selector #foo
```

The `datastar-delete` event is used to delete all elements that match the provided selector.

```go
event: datastar-delete
data: paths foo.bar 1234 abc
```

Using `paths` you are able to delete from the store directly.  If you have fragments relying on these signals you should delete them first.

### datastar-redirect

```go
event: datastar-redirect
data: url /foo
```

The `datastar-redirect` event is used to redirect the page to the provided URI.

### datastar-console

```go
event: datastar-console
data: log This message will be logged to the browser console.
```

The `datastar-console` event is used to output a message to the browser console. The available console modes are:
- `debug`
- `error`
- `info`
- `group`
- `groupEnd`
- `log`
- `warn`

## Attribute Plugins

### Fetch Indicator

```html
<svg id="foo">Spinner</svg>
<button
  data-on-click="$$get('/examples/click_to_edit/contact/1')"
  data-fetch-indicator="#foo"
  data-bind-disabled="$$isFetching('#foo')"
></button>
```

Show a spinner when the request is in flight. The `data-fetch-indicator` attribute should be a CSS selector to the element(s). When the attribute is present, the element will be hidden when requests are not in flight and shown when they are.

The `$$isFetching` action returns a computed value that allows you to easily react to the state of the indicator.


### Headers

```html
<div
		data-header-x-csrf-token="JImikTbsoCYQ9oGOcvugov0Awc5LbqFsZW6ObRCxuqFHDdPbuFyc4ksPVVa9+EB4Ag+VU6rpc680edNFswIRwg=="></div>
```

Can be added anywhere on the page and will be included on SSE fetches.  In general, you should lean to Cookies unless your backend framework demand it.
