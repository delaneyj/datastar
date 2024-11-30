## Multi-line Merge Signals

## Demo

<div data-merge-signals="{
    foo:1234,
    bar:'bar'
}">
    <input
        type="number"
        step="1"
        min="0"
        max="10"
        data-bind="foo"
        class="input input-bordered"
    />
    <input
        type="text"
        data-bind="bar"
        class="input input-bordered"
    />
</div>

## Explanation

```html
<div
  data-merge-signals="{
    foo:1234,
    bar:'bar'
}"
>
  <input type="number" step="1" min="0" max="10" data-bind="foo" />
  <input type="text" data-bind="bar" />
</div>
```

The `data-merge-signals` attribute is used to define a signals object. The signals object is a JS object. 
