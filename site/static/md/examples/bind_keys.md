## Bind Keys

## Demo

<h1 data-on-keydown__window="evt.ctrlKey && evt.key =='k' && alert('you hit the cheat code!')">Press Ctrl+K</h1>
<h1 data-on-keydown__window="evt.key == 'Enter' && alert('you hit the other code!')">Press Enter</h1>

## Explanation

```html
<h1 data-on-keydown__window="evt.ctrlKey && evt.key =='k' && alert('you hit the cheat code!')">Press Ctrl+K</h1>
<h1 data-on-keydown__window="evt.key == 'Enter' && alert('you hit the other code!')">Press Enter</h1>
```

Able to bind to any value on the `event`. Because of how `data-*` attributes are interpreted you'll need to use `kebab-case` for `camelCase` attributes.
