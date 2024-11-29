## Dialogs

[Original HTMX Version](https://htmx.org/examples/dialogs/)

## Demo

<div
    id="dialogs"
    data-on-load="@get('/examples/dialogs_browser/data')"
>
</div>

## Explanation

Dialogs can be triggered with the standard browser `prompt` and `confirm` within an expression. These are triggered by the user interaction that would trigger the fetch, but the request is only sent if the dialog is accepted.

```html
<button
  id="dialogs"
  data-store="{prompt:'foo',confirm:false}"
  data-fetch-url=""
  data-on-click="$prompt=prompt('Enter a string',$prompt);$confirm=confirm('Are you sure?');$confirm && @get('/examples/dialogs___browser/sure')"
>
  Click Me
</button>
```

The value provided by the user to the prompt dialog is fed back into the store, and the confirm dialog is used to determine whether the request should be sent.
