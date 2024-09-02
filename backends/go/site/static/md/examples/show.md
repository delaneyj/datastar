## Show

## Demo

<div id="container" data-on-load="$$get('/examples/show/data')"></div>

## Explanation

This example displays how to use the show attribute. You can use show without modifiers:

```html
<div
  id="container"
  class="flex flex-col gap-4"
  data-store={ templ.JSONString(store) }
>
  <button
    class="btn btn-primary"
    data-on-click="$bindBool=!$bindBool">
    Toggle
  </button>
    <div data-show="$bindBool">
    Hello!
  </div>
</div>
```

And with modifiers:

```html
<div
  id="container"
  class="flex flex-col gap-4"
  data-store={ templ.JSONString(store) }
>
  <button
    class="btn btn-primary"
    data-on-click="$bindBoolAnimation=!$bindBoolAnimation">
    Toggle
  </button>
  <div data-show.duration_500ms="$bindBoolAnimation">
  Hello Animation!
  </div>
</div>
```