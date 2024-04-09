## On load

## Demo

<div id="replaceMe" data-on-load="$$get('/examples/on_load/data')">Replace me on load</div>

## Explanation

```html
<div id="replaceMe" data-on-load="$$get('/examples/on_load/data')">
  Replace me on load
</div>
```

The `data-on-load` attribute is used to specify a fetch request that should be made when the element is loaded. The value of the attribute is a JavaScript expression that is evaluated when the element is loaded.

**Note:** In this case its targeting the `#replaceMe` element but its up to the SSE returned to how the page is updated.
