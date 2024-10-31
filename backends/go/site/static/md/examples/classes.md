## Classes

## Demo

<div
    data-store="{count:0}"
    data-on-raf.throttle_500ms="$count++"
    data-computed-blinker="$count % 2 === 0"
>
    <div data-text="$count">Count</div>
    <div data-class="{'text-primary':$blinker,'font-bold':$blinker}">
        Remake blink tag
    </div>
</div>

## Explanation

```html
<div
    data-store="{count:0}"
    data-on-raf.throttle_500ms="$count++"
    data-computed-blinker="$count % 2 === 0"
>
    <div data-text="$count">Count</div>
    <div data-class="{'text-primary':$blinker,'font-bold':$blinker}">
        Remake blink tag
    </div>
</div>
```

Here we are using computed signal to store a boolean then use it to drive classes
