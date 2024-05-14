## Fetch Signal

## Demo

<div data-show="$fetch_signal">Loading Signal</div>
<button type="button" class="p-2 bg-accent-200 text-accent-700 shadow rounded" data-on-click="$$get('/examples/fetch_signal/greet')" data-fetch-signal="'fetch_signal'">Click me for a greeting</button>
<div id="greeting"></div>


## Explanation
```html
<div data-show="$fetch_signal">Loading Signal</div>
<button
  type="button"
  class="p-2 bg-accent-200 text-accent-700 shadow rounded"
  data-on-click="$$get('/examples/fetch_signal/greet')"
  data-fetch-signal="'fetch_signal'"
>
  Click me for a greeting
</button>
<div id="greeting"></div>
```

The `data-fetch-signal` attribute is used to specify the name of the signal that should reflect if the fetch request is in progress. The value of the attribute is a valid javascript object key name that is inserted into the $fetch store.
The signal will be set to true only when the element is updating.

**Note:** The contents of the `data-fetch-signal` is an expression. In this case, the expression is a string literal, hence the single quotes around the key name.
