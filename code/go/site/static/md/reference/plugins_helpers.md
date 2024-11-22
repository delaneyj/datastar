# Action Plugins

[Source](https://github.com/starfederation/datastar/blob/main/packages/library/src/lib/plugins/official/helpers.ts)

## `$setAll(regexp: string, value: any)`

```html
<div data-on-change="$setAll('contact_', $selections.all)"></div>
```

Sets all the signals that start with the prefix to the value of the second argument. This is useful for setting all the values of a form at once.

## `$toggleAll(regexp: string)`

```html
<div data-on-click="$toggleAll('contact_')"></div>
```

Toggles all the signals that start with the prefix. This is useful for toggling all the values of a form at once.

## `$clipboard(text: string)`

```html
<div data-on-click="$clipboard('Hello, world!')"></div>
```

Copies the text to the clipboard. This is useful for copying text to the clipboard.

## `$fit(v: number, oldMin:number, oldMax:number, newMin, newMax)`

Make a value linear interpolate from an original range to new one.


## `$fitInt(v: number, oldMin:number, oldMax:number, newMin, newMax)`

Same as `$fit` but rounded to nearest integer

## `$clampFit(v: number, oldMin:number, oldMax:number, newMin, newMax)`

Same as `$fit` but clamped to `newMin` -> `newMax` range

## `$clampFitInt(v: number, oldMin:number, oldMax:number, newMin, newMax)`

Same as `$clampFit` but rounded to nearest integer
