## Form Data

## Demo

<form id="myform" class="space-y-8">
  <label class="flex items-center gap-2 input input-bordered">
    foo
    <input name="foo" required class="grow"/>
  </label>
  <div class="space-x-4">
    <button data-on-click="sse('/examples/form_data/data', {form: true})" class="btn btn-primary">
      Submit GET request
    </button>
    <button data-on-click="sse('/examples/form_data/data', {form: true, method: 'post'})" class="btn btn-primary">
      Submit POST request
    </button>
  </div>
</form>

<button data-on-click="sse('/examples/form_data/data', {form: '#myform'})" class="btn btn-primary">
  Submit form from outside
</button>

<div class="space-y-8">
  <label class="flex items-center gap-2 input input-bordered">
    bar
    <input name="bar" required class="grow"/>
  </label>
  <button data-on-click="sse('/examples/form_data/data', {form: true})" class="btn btn-primary">
    Submit without a wrapping form
  </button>
</div>

## Explanation

```html
<form>
  <input name="foo" required>
  <button data-on-click="sse('/endpoint', {form: true})">
    Submit GET request
  </button>
  <button data-on-click="sse('/endpoint', {form: true, method: 'post'})">
    Submit POST request
  </button>
</form>

<button data-on-click="sse('/endpoint', {form: '#myform'})">
  Submit form from outside
</button>
```