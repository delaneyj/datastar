## Classes

## Demo

<div
    data-merge-signals="{count:0}"
    data-on-raf.throttle_500ms="@increment('count',1)"
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
  data-merge-signals="{count:0}"
  data-on-raf.throttle_500ms="@increment('count',1)"
  data-computed-blinker="$count % 2 === 0"
>
  <div data-text="$count">Count</div>
  <div data-class="{'text-primary':$blinker,'font-bold':$blinker}">
    Remake blink tag
  </div>
</div>
```

Here we are using computed signal to signals a boolean then use it to drive classes
