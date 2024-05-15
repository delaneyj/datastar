## Fetch Indicator

## Demo

<div id="ind">Loading Indicator</div>
<button type="button" class="p-2 bg-accent-200 text-accent-700 shadow rounded" data-on-click="$$get('/examples/fetch_indicator/greet')" data-fetch-indicator="'#ind'" data-testid="greeting_button">Click me for a greeting</button>
<div id="greeting"></div>

<div>Example from https://github.com/delaneyj/datastar/pull/24</div>
<div data-store="{input: ''}">
  <input type="text" data-bind-readonly="$$isFetching('#submit')" data-model="input" class="bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5" />
  <div data-show="$$isFetching('#submit')">Loading...</div>
  <button id="submit" data-bind-disabled="$$isFetching('#submit')" data-on-click="$$get('/examples/fetch_indicator/greet')">Submit</button>
</div>

## Explanation

```html
<div id="ind">Loading Indicator</div>
<button
  type="button"
  class="p-2 bg-accent-200 text-accent-700 shadow rounded"
  data-on-click="$$get('/examples/fetch_indicator/greet')"
  data-fetch-indicator="'#ind'"
>
  Click me for a greeting
</button>
<div id="greeting"></div>
```

The `data-fetch-indicator` attribute is used to specify the element that should be shown as a loading indicator while the fetch request is in progress. The value of the attribute is a CSS selector that selects the element to be shown as the loading indicator.

**Note:** The contents of the `data-fetch-indicator` is an expression. In this case, the expression is a string literal, hence the single quotes around the CSS selector.
