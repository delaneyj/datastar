## Active Search

[Original HTMX Version](https://htmx.org/examples/active-search/)

## Explanation
This example actively searches a contacts database as the user enters text.

We start with a search input and an empty table:
```html
<h3>
  Search Contacts
  <span class="htmx-indicator">
    <img src="/img/bars.svg"/> Searching...
   </span>
</h3>
<input class="form-control" type="search"
       name="search" placeholder="Begin Typing To Search Users..."
       hx-post="/search"
       hx-trigger="input changed delay:500ms, search"
       hx-target="#search-results"
       hx-indicator=".htmx-indicator">

<table class="table">
    <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Email</th>
    </tr>
    </thead>
    <tbody id="search-results">
    </tbody>
</table>
```

The input issues a `POST` to `/search` on the `input` event and sets the body of the table to be the resulting content. Note that the keyup event could be used as well, but would not fire if the user pasted text with their mouse (or any other non-keyboard method).

We add the `debounce_500ms` modifier to the trigger to delay sending the query until the user stops typing. Additionally, we add the changed modifier to the trigger to ensure we don’t send new queries when the user doesn’t change the value of the input (e.g. they hit an arrow key, or pasted the same value).

Since we use a search type input we will get an x in the input field to clear the input. To make this trigger a new POST we have to specify another trigger. We specify another trigger by using a comma to separate them. The search trigger will be run when the field is cleared but it also makes it possible to override the 500 ms input event delay by just pressing enter.

Finally, we show an indicator when the search is in flight with the datastar-indicator attribute.

## Demo
<div>
<div
    id="active_search"
    data-fetch-url="'/examples/active_search/data'"
    data-on-load="$$get"
>
     Replace me
</div>
</div>