
## Demo

<div data-store="{nested:{test1:'foo',test2:'bar',test3:'baz' }}" data-persist-foo="`nested.test1 nested.test3`">
    <input class="input input-bordered" data-model="nested.test1"/>
    <pre data-text="JSON.stringify(ctx.store(),null,2)">Replace me</pre>
</div>

## Explanation

```html
<div data-store="{nested:{test1:'foo',test2:'bar',test3:'baz' }}" data-persist-foo="`nested.test1 nested.test3`">
    <input class="input input-bordered" data-model="nested.test1"/>
    <pre data-text="JSON.stringify(ctx.store(),null,2)">Replace me</pre>
</div>
```

Look at your Local Storage in your browser's developer tools.

In this example we are caching the `nested.test1` and `nested.test3` values in the Local Storage.

If you don't use any values it will cache the entire store.
