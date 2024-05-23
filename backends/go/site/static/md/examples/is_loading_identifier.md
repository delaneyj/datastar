## Is loading identifier

## Demo

<div>
  <div data-show="$$isLoading('get_greet')" id="loadingIndicator">Loading Signal</div>
  <button
    type="button"
    class="flex items-center select-none justify-center gap-1 px-4 py-2 rounded-lg bg-success-700"
    data-on-click="$$get('/examples/is_loading_identifier/greet')"
    data-is-loading-id="get_greet"
    id="greetingButton"
  >Click me for a greeting</button>
  <div id="greeting"></div>
</div>

## Explanation

```html
<div>
  <div data-show="$$isLoading('get_greet')" id="loadingIndicator">
    Loading Signal
  </div>
  <button
    type="button"
    data-on-click="$$get('/examples/is_loading_identifier/greet')"
    data-is-loading-id="get_greet"
    id="greetingButton"
  >
    Click me for a greeting
  </button>
  <div id="greeting"></div>
</div>
```

The `data-is-loading-id` attribute is used to specify the name of the identifier that will be present in the store's isLoading array when an element is fetching.
