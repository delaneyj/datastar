## Is loading identifier

## Demo

<div data-show="$isLoading.includes('get_greet')">Loading Signal</div>
<button type="button" class="p-2 bg-accent-200 text-accent-700 shadow rounded" data-on-click="$$get('/examples/is_loading_identifier/greet')" data-is-loading-id="get_greet">Click me for a greeting</button>
<div id="greeting"></div>

## Explanation

```html
<div data-show="$isLoading.includes('get_greet')">Loading Signal</div>
<button
  type="button"
  class="p-2 bg-accent-200 text-accent-700 shadow rounded"
  data-on-click="$$get('/examples/is_loading_identifier/greet')"
  data-is-loading-id="get_greet"
>
  Click me for a greeting
</button>
<div id="greeting"></div>
```

The `data-is-loading-id` attribute is used to specify the name of the identifier that will be present in the global isLoading array when an element is fetching.
