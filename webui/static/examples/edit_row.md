## Edit Row

[Original HTMX Version](https://htmx.org/examples/edit-row/)

## Demo
<div
    id="edit_row"
    data-fetch-url="'/examples/edit_row/data'"
    data-on-load="$$get"
>
     Replace me!
</div>

## Explanation
This example shows how to implement editable rows. First let’s look at the table body:
```html
<table class="table delete-row-example">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th></th>
    </tr>
  </thead>
  <tbody hx-target="closest tr" hx-swap="outerHTML">
    ...
  </tbody>
</table>
```
This will tell the requests from within the table to target the closest enclosing row that the request is triggered on and to replace the entire row.

Here is the HTML for a row:
```html
<tr>
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>
    <button class="btn btn-danger"
            hx-get="/contact/${contact.id}/edit"
            hx-trigger="edit"
            _="on click
                  if .editing is not empty
                    Swal.fire({title: 'Already Editing',
                              showCancelButton: true,
                              confirmButtonText: 'Yep, Edit This Row!',
                              text:'Hey!  You are already editing a row!  Do you want to cancel that edit and continue?'})
                    if the result's isConfirmed is false
                      halt
                    end
                    send cancel to .editing
                  end
                  trigger edit">
      Edit
    </button>
  </td>
</tr>
```
Here we are getting a bit fancy and only allowing one row at a time to be edited, using [hyperscript](https://hyperscript.org/). We check to see if there is a row with the `.editing` class on it and confirm that the user wants to edit this row and dismiss the other one. If so, we send a cancel event to the other row so it will issue a request to go back to its initial state.

We then trigger the `edit` event on the current element, which triggers the htmx request to get the editable version of the row.

Note that if you didn’t care if a user was editing multiple rows, you could omit the hyperscript and custom `hx-trigger`, and just let the normal click handling work with htmx. You could also implement mutual exclusivity by simply targeting the entire table when the Edit button was clicked. Here we wanted to show how to integrate htmx and hyperscript to solve the problem and narrow down the server interactions a bit, plus we get to use a nice SweetAlert confirm dialog.

Finally, here is what the row looks like when the data is being edited:
```html
<tr hx-trigger='cancel' class='editing' hx-get="/contact/${contact.id}">
  <td><input name='name' value='${contact.name}'></td>
  <td><input name='email' value='${contact.email}'></td>
  <td>
    <button class="btn btn-danger" hx-get="/contact/${contact.id}">
      Cancel
    </button>
    <button class="btn btn-danger" hx-put="/contact/${contact.id}" hx-include="closest tr">
      Save
    </button>
  </td>
</tr>
```

Here we have a few things going on: First off the row itself can respond to the `cancel` event, which will bring back the read-only version of the row. This is used by the hyperscript above. There is a cancel button that allows cancelling the current edit. Finally, there is a save button that issues a `PUT` to update the contact. Note that there is an `hx-include` that includes all the inputs in the closest row. Tables rows are notoriously difficult to use with forms due to HTML constraints (you can’t put a `form` directly inside a `tr`) so this makes things a bit nicer to deal with.