## Click to Edit

[Original HTMX Version](https://htmx.org/examples/click-to-edit/)

## Demo
<div
    id="contact_1"
    data-fetch-url="'/examples/click_to_edit/contact/1'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation
The click to edit pattern provides a way to offer inline editing of all or part of a record without a page refresh.  This pattern starts with a UI that shows the details of a contact. The div has a button that will get the editing UI for the contact from `/contact/1/edit`

```html
<!-- Removed styling -->
<div id="contact_1">
    <label>First Name: John</label>
    <label>Last Name: Doe</label>
    <label>Email: joe@blow.com</label>
    <div>
        <button
            data-fetch-url="'/examples/click_to_edit/contact/1/edit'"
            data-on-click="$$get">
            Edit
        </button>
        <button
            data-fetch-url="'/examples/click_to_edit/contact/1/reset'"
            data-on-click="$$get">
            Reset
        </button>
    </div>
</div>
```
This returns a form that can be used to edit the contact
```html
<!-- Removed styling and escaping for brevity -->
<div
    id="contact_1"
    data-merge-store="{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'joe@blow.com'
    }"
>
    <div class="form-control">
        <label>First Name</label>
        <input type="text" data-model="firstName">
    </div>
    <div>
        <label>Last Name</label>
        <input type="text" data-model="lastName">
    </div>
    <div>
        <label>Email</label>
        <input type="text" data-model="email">
    </div>
    <div>
        <button
            data-fetch-url="'/examples/click_to_edit/contact/1'"
            data-on-click="$$put">
            Save
        </button>
        <button
            data-fetch-url="'/examples/click_to_edit/contact/1'"
            data-on-click="$$get">
            Cancel
        </button>
    </div>
</div>
```
### There is no form
If you compare to HTMX you'll notice there is no form, you can use one but its unnecessary.  This is because you are already using signals and when you use a `PUT` to `/contact/1/edit`, the body is the entire contents of the store and its available to handle errors and validation holistically.  There is also a profanity filter on the normal rendering of the contact that is not applied to the edit form.  Controlling the rendering complete on the server allows you to have a single source of truth for the data and the rendering.