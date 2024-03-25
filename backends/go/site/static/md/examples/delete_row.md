## Delete Row

[Original HTMX Version](https://htmx.org/examples/delete-row/)

## Demo

<style>
tr.datastar-swapping td {
  opacity: 0;
  transition: opacity 1s ease-out;
}
</style>

<div
    id="delete_row"
    data-on-load="$$get('/examples/delete_row/data')"
>
     Replace me
</div>

## Explanation

This example shows how to implement a delete button that removes a table row upon completion. First let's look at the
table body:

```html
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr id="contact_0">
      <td>Joe Smith</td>
      <td>joe@smith.org</td>
      <td>Active</td>
      <td>
        <button
          data-on-click="confirm('Are you sure?') && $$delete('/examples/delete_row/data/0')"
        >
          Delete
        </button>
      </td>
    </tr>
    ...
  </tbody>
</table>
```

The row has a normal [`confirm`]([@/attributes/hx-confirm.md] to confirm the delete action. There is no need for an `hx-confirm` and easy enough to use directly when desired. We also use the following CSS to fade out.

```css
tr.datastar-swapping td {
  opacity: 0;
  transition: opacity 1s ease-out;
}
```

To fade the row out before it is swapped/removed.
