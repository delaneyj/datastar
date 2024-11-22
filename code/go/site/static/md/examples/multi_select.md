## Multi-select

## Demo

<div data-store="{cars:[]}">
  <label class="form-control w-full max-w-xs">
    <div class="label label-text">What's your favorite car?</div>
    <select class="select select-bordered select-lg" name="cars" data-model="cars" multiple>
      <option disabled selected>What's your favorite car</option>
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="opel">Opel</option>
      <option value="audi">Audi</option>
    </select>
  </label>
  <pre data-text="JSON.stringify(ctx.store().value, null, 2)">Store</pre>
</div>

## Explanation

```html
<div data-store="{cars:[]}">
  <select data-model="cars" multiple>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="opel">Opel</option>
    <option value="audi">Audi</option>
  </select>
  <pre data-text="JSON.stringify(ctx.store().value, null, 2)">Store</pre>
</div>
```

Sometimes you need multi-select.