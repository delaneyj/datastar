## Fetch Indicator

## Demo 

<div>
  <div id="ind">Loading Indicator</div>
  <button
    class="bg-success-300 hover:bg-success-500 text-success-800 font-bold py-2 px-4 rounded"
    data-on-click="$$get('/examples/fetch_indicator/greet')"
    data-fetch-indicator="'#ind'"
    data-testid="greeting_button"
    data-bind-disabled="$$isFetching('#ind')"
>
    Click me for a greeting
  </button>
  <div id="greeting"></div>
</div>

## Explanation

```html
<div id="ind">Loading Indicator</div>
<button
  data-on-click="$$get('/examples/fetch_indicator/greet')"
  data-fetch-indicator="'#ind'"
  data-bind-disabled="$$isFetching('#ind')"
>
  Click me for a greeting
</button>
<div id="greeting"></div>
```

The `data-fetch-indicator` attribute is used to specify the element that should be shown as a loading indicator while the fetch request is in progress. The value of the attribute is a CSS selector that selects the element to be shown as the loading indicator.

The `$$isFetching("#ind")` action returns a computed value that allows you to easily query the state of the indicator. It has a sister action `$$withFetching("#ind")` that instead returns the indicator element itself.

**Note:** The contents of the `data-fetch-indicator` is an expression. In this case, the expression is a string literal, hence the single quotes around the CSS selector.
