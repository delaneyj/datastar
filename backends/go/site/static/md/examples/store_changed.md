## Store Changed

## Demo

<div
  data-store="{clicks:0, _localState: { bar: 1234}, _anotherLocalVar: 'hello'}"
  data-on-store-change.remote="$$post('/examples/store_changed/updates')"
  >
    <div class="flex gap-4">
      <button
        id="increment"
        class="btn btn-success"
        data-on-click="$clicks++"
        >Click Me</button>
      <button
        id="clear"
        class="btn btn-warning"
        data-on-click="$clicks=0; $$delete('/examples/store_changed/updates')"
      >Clear Local & Server</button>
      <button
        id="reload"
        class="btn btn-error"
        data-on-click="window.location.reload()"
      >Reload Page</button>
    </div>
    <div id="local_clicks">Local Clicks: <span data-text="$clicks"></span></div>
    <div id="from_server"></div>
</div>

## Explanation

```html
<div
  data-store="{clicks:0, _localState: { bar: 1234}, _anotherLocalVar: 'hello'}"
  data-on-store-change.remote="$$post('/examples/store_changed/updates')"
>
  <div>
    <button id="increment" data-on-click="$clicks++">Click Me</button>
    <button
      id="clear"
      data-on-click="$clicks=0; $$delete('/examples/store_changed/updates')"
    >
      Clear Local & Server
    </button>
    <button id="reload" data-on-click="window.location.reload()">
      Reload Page
    </button>
  </div>
  <div>Local Clicks: <span data-text="$clicks"></span></div>
  <div id="from_server"></div>
</div>
```

`data-on-store-change` is a special event that is triggered when the store changes. This is useful for updating the UI when the store changes. In this example we update the `clicks` store with a new value. This triggers a re-render of the `clicks` span element. You can still use the `throttle` and `debounce` modifiers to control the rate of updates even further. In this case we are sending the store changes to the server to update the lifetime total clicks the server has seen.

**Note**: The `.remote` modifier is used to only trigger this event when remotely viewable signals are updated. This is useful for not sending data that is not needed to the server. To look at the details run `console.log(JSON.stringify(ds.store.value,null,2))` in the browser console. You should see something like

```json
{
  "_dsPlugins": {
    "on": {}
  },
  "_sidebarOpen": false,
  "clicks": 0,
  "_localState": {
    "bar": 1234
  },
  "_anotherLocalVar": "hello"
}
```

Whereas if you look at the Network tab in the browser you should see the following request payload

```json
{ "clicks": 0 }
```

Any signal (or nested set of signals) starting with an underscore `_` is considered local and will not be sent to the server. In this example `_localState` and `_anotherLocalVar` are local only.
