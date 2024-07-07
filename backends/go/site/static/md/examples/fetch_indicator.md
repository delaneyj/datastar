## Fetch Indicator

## Demo

<div class="flex flex-col gap-4" >
  <div id="ind" class="flex items-center gap-2">
    <iconify-icon  icon="svg-spinners:blocks-wave"></iconify-icon>
    <span>Loading</span>
  </div>
    <button
    class="btn btn-primary"
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

The `data-fetch-indicator` attribute is used to specify the elements that should be made visible when the fetch request is in progress. The value of the attribute is a CSS selector that can represent multiple elements. The same `data-fetch-indicator` selector can be used by different elements at the same time.

The `$$isFetching("#ind")` action returns a computed value that allows you to easily react to the state of the indicator.

**Note:** The contents of the `data-fetch-indicator` is an expression. In this case, the expression is a string literal, hence the single quotes around the CSS selector.
