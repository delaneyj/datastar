# Attribute Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/packages/library/src/lib/plugins/attributes.ts)

Primarily used to help hook up the store and the DOM.

## Attributes Plugins

### Bind

```html
<div data-bind-disabled="$iShouldBeDisabled"></div>
```

Allows any valid attribute to be bound to an expression. This is useful for making elements reactive. Also, can be used as a fallback for any attribute that is not supported by a plugin currently.

### Model

```html
<input data-model="foo" />
```

Sets up two-way data-binding on an element.

**Note:** Always binds to a signal and therefore should exclude the `$` prefix from the signal name. Event listeners are added for `change`, `input` and `keydown` events on `input`,`textarea`, `select`, `checkbox` and `radio` elements.

### Text

```html
<div data-text="$foo"></div>
```

Sets the text content of an element to the value of the signal. This is useful for setting the text content of an element to a signal value. Can use any expression that is valid in the system. For example, `data-text="$foo + 'bar'"` would set the text content to the value of `$foo` plus the string `bar`.

### On

```html
<button data-on-click="$$fn('foo','bar',1234)">Click Me</button>
```

Sets up an event listener on an element. The event listener will trigger the action specified in the expression. The expression can be any valid expression in the system. For example, `data-on-click="$$fn('foo','bar',1234)"` would trigger the action `fn` with the arguments `'foo','bar',1234` when the button is clicked.

If any signal in the expression changes, the event listener will be updated to reflect the new value of the signal automatically.

An `evt` variable that represents the event object is available in the expression.

```html
<div data-on-myevent="$eventDetails=evt.detail"></div>
```

The `data-on-*` matches DOM events, however there are currently a few special cases for custom events.

1.  `data-on-load` which is triggered when the element is loaded into the DOM.
2.  `data-on-store-change` which is triggered when the store changes.
3.  `data-on-raf` which is triggered on every requestAnimationFrame event.

#### Modifiers
- `.once`\* - Only trigger the event listener once
- `.passive`\* - Do not call `preventDefault` on the event listener
- `.capture`\* - Use a capture event listener
- `.debounce` - Debounce the event listener
  - `_1000ms` - Debounce for 1000ms
  - `_1s` - Debounce for 1s
  - `_leading` - Debounce with leading edge
  - `_noTrail` - Debounce without trailing edge
- `.throttle` - Throttle the event listener
  - `_1000ms` - Throttle for 1000ms
  - `_1s` - Throttle for 1s
  - `_noLead` - Throttle without leading edge
  - `_noTrail` - Throttle without trailing edge
- `.window` - Attaches the event listener to the `window` element

\*only works currently on native events

### Class

```html
<div data-class="{'text-primary':$primary,'font-bold':$bold}"></div>
```

Adds or removes each of the keys in the set of key-value pairs to the element’s class list, depending on whether the values evaluate to true or false, respectively.
