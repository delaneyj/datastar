## Multi-line Store

## Demo

<div data-store="{
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
  data-store="{
    foo:1234,
    bar:'bar'
}"
>
  <input type="number" step="1" min="0" max="10" data-bind="foo" />
  <input type="text" data-bind="bar" />
</div>
```

The `data-store` attribute is used to define a store object. The store object is a JS object. Before you could not have a multi-line store object. Now you can.
