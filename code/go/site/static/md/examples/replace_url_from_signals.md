## Replace URL from Backend

## Demo

<div
    data-store="{page:0}"
    data-on-raf.throttle_1s="$page = $page + 1"
    data-replace-url="'/examples/replace_url_from_signals?page=' + $page"
>
</div>

## Explanation

```html
<div
    data-store="{page:0}"
    data-on-raf.throttle_1s="$page = $page + 1"
    data-replace-url="'/examples/replace_url_from_signals?page=' + $page"
>
</div>
```

The `data-replace-url` attribute is a special attribute that is used to replace the URL in the browser without reloading the page. This is useful for updating the URL when the user interacts with the page. In this example we update the URL with the current page number every second. This is done by incrementing the `page` store every second. The `data-on-raf.throttle_1s` event is triggered every second and increments the `page` store. This triggers a re-render of the `page` store and updates the URL in the browser. You can still use the `throttle` and `debounce` modifiers to control the rate of updates even further.