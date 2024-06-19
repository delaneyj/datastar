# Backend Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/packages/library/src/lib/plugins/backend.ts)

A set of plugins that allow for the integration of any backend services that supports SSE with Datastar.

## Attribute Plugins

Request for data from the server via SSE and merge with the page.

## Action Plugins

### `$$get`, `$$post`, `$$put`, `$$patch`, `$$delete`

```html
<div data-on-click="$$get('/examples/click_to_edit/contact/1')"></div>
```

Makes an HTML_VERB request to the server and merges the response with the current DOM and store. The URL can be any valid URL but the response must be a Datastar formatted SSE event.

Every request will be sent with a `{datastar: *}` object containing the current store. When using `$$get` the store will be sent as a query parameter, otherwise it will be sent as a JSON body.

## Datastar SSE Event

An example of a minimal valid response would be:

```go
event: datastar-fragment
data: fragment <div id="foo">Hello!</div>
```

Addtional `data` lines can be added to the response to override the default behavior.

### data-fragment

| Key                             | Description                                                                                                                                                      | Default |     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --- |
| `data: selector #foo`           | Select the target element using a CSS selector. Will be come the target of the `merge` process, otherwise it will use the target of the initiating element's id. |         |
| `data: merge morph_element`     | Merge the fragment using [Idiomorph](https://github.com/bigskysoftware/idiomorph).                                                                               | \*      |
| `data: merge inner_html`        | Replace target's innerHTML with fragment                                                                                                                         |         |
| `data: merge outer_html`        | Replace target's outerHTML with fragment                                                                                                                         |         |
| `data: merge prepend_element`   | Prepend fragment to target's children                                                                                                                            |         |
| `data: merge append_element`    | Append fragment to target's children                                                                                                                             |         |
| `data: merge before_element`    | Insert fragment before target as sibling                                                                                                                         |         |
| `data: merge after_element`     | Insert fragment after target as sibling                                                                                                                          |         |
| `data: merge delete_element`    | Remove target from the DOM                                                                                                                                       |         |
| `data: merge upsert_attributes` | Merge attributes from fragment into target, useful when wanting to just update a store                                                                           |         |
| `data: settle 1000`             | Settle the element after 1000ms, useful for transitions. Defaults to `500` if missing                                                                            | \*      |
| `data: fragment`                | The HTML fragment to merge into the DOM. **_Should only be one per event_**                                                                                      | \*      |
| `data: redirect /foo`           | Redirect the page to `/foo`. Can be used in place of a `data: fragment` **_Should only be one per event_**                                                       |         |
| `data: error oh noes`           | Will throw an error with the message `oh noes` and stop the request. Can be used in place of a `data: fragment` **_Should only be one per event_**               |         |

### datastar-signal

```go
event: datastar-signal
data: {foo: 1234}
```

The `datastar-signal` event is used to update the store with new values. The `data` line should be a valid `data-store` attribute. This will get merged into the store.

## Attribute Plugins

### Header

```html
<div data-header-X-My-Header="foo"></div>
```

Add a header to the request. This can be used to send additional information to the server.

### Fetch Indicator

```html
<svg id="foo">Spinner</svg>
<div
  data-on-click="$$get('/examples/click_to_edit/contact/1')"
  data-fetch-indicator="#foo"
></div>
```

Show a spinner when the request is in flight. The `data-fetch-indicator` attribute should be a CSS selector to the element(s). When the attribute is present, the element will be hidden when requests are not in flight and shown when they are.

### Is Loading Identifier

```html
<svg data-show="$isLoading.includes('edit-contact')">Spinner</svg>
<div
  data-on-click="$$get('/examples/click_to_edit/contact/1')"
  data-is-loading-id="edit-contact"
></div>
```

The `data-is-loading-id` attribute is used to specify the name of the identifier that will be present in the store's isLoading array when an element is fetching.
