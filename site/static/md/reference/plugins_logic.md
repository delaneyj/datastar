# Logic Plugins

[Source Code](https://github.com/starfederation/datastar/blob/main/packages/library/src/lib/plugins/official/logic)

## Action Plugins

### `setAll(pathPrefix: string, value: any)`

```html
<div data-on-change="setAll('contact.', selections.all.value)"></div>
```

Sets all the signals that start with the prefix to the value of the second argument. This is useful for setting all the values of a nested signal at once.

### `toggleAll(pathPrefix: string)`

```html
<div data-on-click="toggleAll('contact.')"></div>
```

Toggles all the signals that start with the prefix. This is useful for toggling all the values of a nested signal at once.

### `fit(v: number, oldMin:number, oldMax:number, newMin, newMax, shouldClamp=false, shouldRound=false)`

Make a value linear interpolate from an original range to new one.
