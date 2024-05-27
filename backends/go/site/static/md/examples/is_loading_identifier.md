## Is loading identifier

## Demo

<div>
  <div data-show="$$isLoading('get_greet')" id="loadingIndicator">Loading Signal</div>
  <button
    type="button"
    class="bg-success-300 hover:bg-success-400 text-success-800 font-bold py-2 px-4 rounded-l"
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
