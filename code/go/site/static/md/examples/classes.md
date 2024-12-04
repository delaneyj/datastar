## Classes

## Demo

<div
    data-signals="{count:0}"
    data-on-raf:throttle_500ms="count.value++"
    data-computed-blinker="count.value % 2 === 0"
>
    <div data-text="count.value">Count</div>
    <div data-class="{'text-primary':blinker.value,'font-bold':blinker.value}">
        Remake blink tag
    </div>
</div>

## Explanation

```html
<div
    data-signals="{count:0}"
    data-on-raf:throttle_500ms="count.value++"
    data-computed-blinker="count.value % 2 === 0"
>
    <div data-text="count.value">Count</div>
    <div data-class="{'text-primary':blinker.value,'font-bold':blinker.value}">
        Remake blink tag
    </div>
</div>
```

Here we are using computed signal to signals a boolean then use it to drive classes
