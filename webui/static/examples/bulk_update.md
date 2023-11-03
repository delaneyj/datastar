## Bulk Update

[Original HTMX Version](https://htmx.org/examples/bulk-update/)

## Demo
<style>
.datastar-settling tr.deactivate td {
 background: lightcoral;
}
.datastar-settling tr.activate td {
 background: darkseagreen;
}
tr td {
transition: all 1.2s;
}
</style>
<div
    id="bulk_update"
    data-fetch-url="'/examples/bulk_update/data'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation
This demo shows how to implement a common pattern where rows are selected and then bulk updated. This is accomplished by putting a form around a table, with checkboxes in the table, and then including the checked values in PUT’s to two different endpoints: `activate` and `deactivate`:

The server will either activate or deactivate the checked users and then rerender the tbody tag with updated rows. It will apply the class activate or deactivate to rows that have been mutated. This allows us to use a bit of CSS to flash a color helping the user see what happened: