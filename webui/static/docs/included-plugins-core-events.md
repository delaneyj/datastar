[Back to Sandboxed Functions](/docs/included-plugins-core-sandboxed-functions)

# Events

![Events](/static/images/events.gif)

Are you listening Mr. Anderson?

Because we are building on top of signals we can easily [add listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) to DOM [events](https://developer.mozilla.org/en-US/docs/Web/Events#event_listing) and have them trigger as effects.  Cleanup with listener [removal](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) is handled automatically.

```html
<button data-on-click="$count++">Increment + </button>
<button data-on-click="$count--">Decrement - </button>
```

You can do this with any event that is supported by the browser.  The only "special" events is `data-on-load="doStuff"` which is triggered when the element is ready on the DOM and actually attached directly to the window object.



[Next Visibility](/docs/included-plugins-ui-visibility)
