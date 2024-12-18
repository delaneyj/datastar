## Form Data

## Demo

<form id="myform" class="space-y-8">
  <label class="flex items-center gap-2 input input-bordered">
    foo
    <input name="foo" required class="grow"/>
  </label>
  <div class="space-x-4">
    <button data-on-click="sse('/examples/form_data/data', {contentType: 'form'})" class="btn btn-primary">
      Submit GET request
    </button>
    <button data-on-click="sse('/examples/form_data/data', {contentType: 'form', method: 'post'})" class="btn btn-primary">
      Submit POST request
    </button>
  </div>
</form>

<button data-on-click="sse('/examples/form_data/data', {contentType: 'form', selector: '#myform'})" class="btn btn-primary">
  Submit GET request from outside the form
</button>

## Explanation

```html
<form>
  <input name="foo" required>
  <button data-on-click="sse('/endpoint', {contentType: 'form'})">
    Submit GET request
  </button>
  <button data-on-click="sse('/endpoint', {contentType: 'form', method: 'post'})">
    Submit POST request
  </button>
</form>

<button data-on-click="sse('/endpoint', {contentType: 'form', selector: '#myform'})">
  Submit GET request from outside the form
</button>
```