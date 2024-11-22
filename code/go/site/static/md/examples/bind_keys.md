## Bind Keys

## Demo

<h1 data-on-keydown.window.ctrl-key.key_k="alert('you hit the cheat code!')">Press Ctrl+K</h1>
<h1 data-on-keydown.window.key_enter="alert('you hit the other code!')">Press Enter</h1>

## Explanation

```html
<h1 data-on-keydown.window.ctrl-key.key_k="alert('you hit the cheat code!')">
  Press Ctrl+K
</h1>
<h1 data-on-keydown.window.key_enter="alert('you hit the other code!')">
  Press Enter
</h1>
```

Able to bind to any value on the `event`. Because of how `data-*` attributes are interpreted you'll need to use `kebab-case` for `camelCase` attributes.
