## Replace URL from signals

## Demo

<div
    data-signals="{page:0}"
    data-on-raf="page.value++"
    data-modifiers-on-raf.throttle.duration="1000"
    data-replace-url="'/examples/replace_url_from_signals?page=' + page.value"
>
</div>

# Look at the URL in the browser address bar!

## Explanation

```html
<div
    data-signals="{page:0}"
    data-on-raf="page.value++"
    data-modifiers-on-raf.throttle.duration="1000"
    data-replace-url="'/examples/replace_url_from_signals?page=' + page.value"
>
</div>
```

The `data-replace-url` attribute is a special attribute that is used to replace the URL in the browser without reloading the page. This is useful for updating the URL when the user interacts with the page. In this example we update the URL with the current page number every second. This is done by incrementing the `page` signals every second. With `data-modifiers-on-raf.throttle.duration="1000"` event is triggered every second and increments the `page` signals. This triggers a re-render of the `page` signals and updates the URL in the browser. You can still use the `:throttle` and `:debounce` modifiers to control the rate of updates even further.
