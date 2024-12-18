## Form

## Demo

<div class="space-y-12">
  <form>
    <label class="flex items-center gap-2 input input-bordered">
      foo1
      <input name="foo1" value="val1" type="text" class="grow"/>
    </label>
    <button data-on-click__prevent="sse('/examples/form/data', {form: true})" class="btn btn-primary">
      Submit GET request with a wrapping form
    </button>
  </form>
  <form class="mt-10">
    <label class="flex items-center gap-2 input input-bordered">
      foo2
      <input name="foo2" value="val2" type="text" class="grow"/>
    </label>
    <button data-on-click__prevent="sse('/examples/form/data', {method: 'post', form: true})" class="btn btn-primary">
      Submit POST request with a wrapping form
    </button>
  </form>
  <div class="mt-10">
    <label class="flex items-center gap-2 input input-bordered">
      foo3
      <input name="foo3" value="val3" type="text" class="grow"/>
    </label>
    <button data-on-click__prevent="sse('/examples/form/data', {form: true})" class="btn btn-primary">
      Submit GET request without a wrapping form
    </button>
  </div>
  <div class="mt-10">
    <label class="flex items-center gap-2 input input-bordered">
      foo4
      <input name="foo4" value="val4" type="text" class="grow"/>
    </label>
    <button data-on-click__prevent="sse('/examples/form/data', {method: 'post', form: true})" class="btn btn-primary">
      Submit POST request without a wrapping form
    </button>
  </div>
</div>

## Explanation

```html
<form>
  <input name="foo">
  <button data-on-click__prevent="sse('/examples/form/data', {method: 'post', form: true})">
    Submit POST request with a wrapping form
  </button>
</form>
```

```html
<div>
  <input name="bar">
  <button data-on-click__prevent="sse('/examples/form/data', {form: true})">
    Submit without a wrapping form
  </button>
</div>
```