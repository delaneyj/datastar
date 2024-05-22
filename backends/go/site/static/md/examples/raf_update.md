## Title Update Frontend

## Demo

<div data-store="{currentTime:new Date()}" data-on-raf="$currentTime = new Date()">
    <div id="time">Current Time: <span data-text="$currentTime"></span></div>
</div>

## Explanation

In the [Title Update Backend](/examples/title_update_backend) example we showed how to update the title of the page using a server sent event fragment. In this example we show how to update the title of the page using a requestAnimationFrame event on the client side.

```html
<div
  data-store="{currentTime:new Date()}"
  data-on-raf="$currentTime = new Date()"
>
  <div id="time">Current Time: <span data-text="$currentTime"></span></div>
</div>
```

`data-on-raf` is a special event that is triggered on every requestAnimationFrame event. This is useful for updating the UI at maximum at the rendering refresh rate of the browser. In this example we update the currentTime store with a new Date object. This triggers a re-render of the currentTime span element. You can still use the `throttle` and `debounce` modifiers to control the rate of updates even further.
