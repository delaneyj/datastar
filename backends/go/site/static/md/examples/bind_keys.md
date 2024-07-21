## Bind Keys

## Demo

<div
    id="bulk_update"
    data-on-keydown.window.ctrl-key.key_k="alert('you hit the cheat code!')"
>
  <h1>Press Ctrl+K</h1>
</div>

## Explanation


```html
<div
    id="bulk_update"
    data-on-keydown.window.ctrl-key.key_k="alert('you hit the cheat code!')"
>
  <h1>Press Ctrl+K</h1>
</div>
```

Able to bind to any value on the `event`.  Because of how `data-*` attributes are interpreted you'll need to use `kebab-case` for `camelCase` attributes.
