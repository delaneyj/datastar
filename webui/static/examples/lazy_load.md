## Lazy Load

[Original HTMX Version](https://htmx.org/examples/lazy-load/)

## Demo
<div>
<style>
.datastar-settling  {
  opacity: 0;
}
</style>
<div
    id="lazy_load"
    data-fetch-url="'/examples/lazy_load/data'"
    data-on-load="$$get"
>
     Replace me
</div>
</div>

## Explanation
This example shows how to lazily load an element on a page. We start with an initial state that looks like this:

```html
<div
  data-fetch-url="'/examples/lazy_load/graph'"
  data-on-load="$$get"
>
  Loading...
</div>
```
Which shows a progress indicator as we are loading the graph. The graph is then loaded and faded gently into view via a settling CSS transition:

```css
.datastar-settling  {
  opacity: 0;
}
```