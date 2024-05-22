## Store Changed

## Demo

<div
  data-store="{clicks:0}"
  data-on-store-change="$$post('/examples/store_changed/updates')"
  >
    <div class="flex gap-4">
      <button
        id="increment"
        class="flex items-center select-none justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600"
        data-on-click="$clicks++"
        >Click Me</button>
      <button
        id="clear"
        class="flex items-center select-none justify-center gap-1 px-4 py-2 rounded-lg bg-error-700 hover:bg-error-600"
        data-on-click="$clicks=0; $$delete('/examples/store_changed/updates')"
      >Clear</button>
    </div>
    <div id="local_clicks">Local Clicks: <span data-text="$clicks"></span></div>
    <div id="from_server"></div>
</div>

## Explanation

```html
<div
  data-store="{clicks:0}"
  data-on-store-change="$$post('/examples/store_changed/updates')"
>
  <div>
    <button data-on-click="$clicks++">Click Me</button>
    <button
      data-on-click="$clicks=0; $$delete('/examples/store_changed/updates')"
    >
      Clear
    </button>
  </div>
  <div>Local Clicks: <span data-text="$clicks"></span></div>
  <div id="from_server"></div>
</div>
```

`data-on-store-change` is a special event that is triggered when the store changes. This is useful for updating the UI when the store changes. In this example we update the `clicks` store with a new value. This triggers a re-render of the `clicks` span element. You can still use the `throttle` and `debounce` modifiers to control the rate of updates even further. In this case we are sending the store changes to the server to update the lifetime total clicks the server has seen.
