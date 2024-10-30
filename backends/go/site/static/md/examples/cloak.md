## Cloak

## Demo

<div>
  <style>
    cloak { display: none; }
  </style>
  <div class="cloak" data-class="{cloak:false}" data-show="true">
    Cloaked text
  </div>
</div>

## Explanation

This example displays how to prevent flickering of the element before Datastar has processed the DOM.
By removing the `cloak` class on initialisation `data-show` will come into effect smoothly.

```html
<style>
  cloak {
    display: none;
  }
</style>

<div
  class="cloak"
  data-class="{cloak:false}"
  data-show="$visible"
>
  Cloaked text
</div>
```
