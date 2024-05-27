## Is Fetching

## Demo

<div>
  <div id="fetchingIndicator" data-show="$$isLoading('#greetingButton')">
    Loading Signal
  </div>
  <button
    id="greetingButton"
    data-on-click="$$get('/examples/is_fetching/greet')"
    data-fetch-indicator="'#fetchingIndicator'"
  >
    Click me for a greeting
  </button>
  <div id="greeting"></div>
</div>

## Explanation

```html
<div>
  <div id="fetchingIndicator" data-show="$$isLoading('#greetingButton')">
    Loading Signal
  </div>
  <button
    id="greetingButton"
    data-on-click="$$get('/examples/is_fetching/greet')"
    data-fetch-indicator="'#fetchingIndicator'"
  >
    Click me for a greeting
  </button>
  <div id="greeting"></div>
</div>
```

The `$$isLoading` action is used to specify the selector that will be present when an element is fetching.
