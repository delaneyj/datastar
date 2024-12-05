# Logic Plugins

[Source Code](https://github.com/starfederation/datastar/blob/main/packages/library/src/lib/plugins/official/logic)

## Action Plugins

### `setAll(regexp: string, value: any)`

```html
<div data-on-change="setAll('contact_', $selections.all)"></div>
```

Sets all the signals that start with the prefix to the value of the second argument. This is useful for setting all the values of a form at once.

### `toggleAll(regexp: string)`

```html
<div data-on-click="toggleAll('contact_')"></div>
```

Toggles all the signals that start with the prefix. This is useful for toggling all the values of a form at once.

### `fit(v: number, oldMin:number, oldMax:number, newMin, newMax, shouldClamp=false, shouldRound=false)`

Make a value linear interpolate from an original range to new one.
