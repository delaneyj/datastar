# Action Plugins

## Backend Plugins

[Source Code](https://github.com/starfederation/datastar/blob/main/library/src/plugins/official/backend/actions)

Allow for the integration of any backend service that supports SSE.

### `sse()`

Arguments: `sse(url: string, options={})`

Sends a `fetch` request to the backend and merges the response with the current DOM and signals. The URL can be any valid URL and the response must contain zero or more [Datastar SSE events](/reference/sse_events).

```html
<div data-on-click="sse('/endpoint')"></div>
```

Every request is sent with a `{datastar: *}` object containing the current signals (except for local signals whose keys begin with an underscore). When using a `get` request, the signals are sent as a query parameter, otherwise they are send as a JSON body.

#### Options

The `sse()` action takes a second argument of options.

- `method` - The HTTP method to use. Defaults to `get`.
- `includeLocal` - Whether to include local signals (those beggining with an underscore) in the request. Defaults to `false`.
- `headers` - An object containing headers to send with the request.
- `openWhenHidden` - Whether to keep the connection open with the page is hidden. Defaults to `false`. Useful for dashboards but can cause a drain on battery life and other resources.
- `retryScaler` - A numeric multiplier applied to scale retry wait times. Defaults to `2`.
- `retryMaxWaitMs` - The maximum allowable wait time in milliseconds between retries. Defaults to `30000` (30 seconds).
- `retryMaxCount` - The maximum number of retry attempts. Defaults to `10`.
- `abort` - An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) object that can be used to cancel the request.

```html
<div data-on-click="sse('/endpoint', {
  method: 'post',
  onlyRemoteSignals: false,
  headers: {
    'X-Csrf-Token': 'JImikTbsoCYQ9oGOcvugov0Awc5LbqFsZW6ObRCxuqFHDdPbuFyc4ksPVVa9+EB4Ag+VU6rpc680edNFswIRwg==',
  },
  openWhenHidden: true,
})"></div>
```

## Logic Plugins

[Source Code](https://github.com/starfederation/datastar/blob/main/library/src/plugins/official/logic/actions)

Provides actions for performing logic operations.

### `setAll()`

Arguments: `setAll(pathPrefix: string, value: any)`

Sets all the signals that start with the prefix to the expression provided in the second argument. This is useful for setting all the values of a nested signal at once.

```html
<div data-on-change="setAll('foo.', true)"></div>
```

### `toggleAll()`

Arguments: `toggleAll(pathPrefix: string)`

Toggles all the signals that start with the prefix. This is useful for toggling all the values of a nested signal at once.

```html
<div data-on-click="toggleAll('foo.')"></div>
```

### `fit()`

Arguments: `fit(v: number, oldMin:number, oldMax:number, newMin, newMax, shouldClamp=false, shouldRound=false)`

Make a value linear interpolate from an original range to new one.
