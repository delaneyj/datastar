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
        data-model="foo"
        class="input input-bordered"
    />
    <input
        type="text"
        data-model="bar"
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
  <input type="number" step="1" min="0" max="10" data-model="foo" />
  <input type="text" data-model="bar" />
</div>
```

The `data-store` attribute is used to define a store object. The store object is a JS object. Before you could not have a multi-line store object. Now you can.
