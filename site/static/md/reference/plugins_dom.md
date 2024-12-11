# DOM Plugins

[Source Code](https://github.com/starfederation/datastar/blob/main/library/src/plugins/official/dom)

Primarily used to help hook up the signals and the DOM.

## Attribute Plugins

### Attributes

```html
<div data-attributes-disabled="iShouldBeDisabled.value"></div>
```

```html
<div data-attributes="{disabled: iShouldBeDisabled.value}"></div>
```

Allows any valid attribute to be bound to an expression. This is useful for making elements reactive. Also, can be used as a fallback for any attribute that is not supported by a plugin currently.

### Bind

```html
<input data-bind-foo />
```

Sets up two-way data-binding on an element.

**Note:** Event listeners are added for `change`, `input` and `keydown` events on `input`,`textarea`, `select`, `checkbox` and `radio` elements.

### Text

```html
<div data-text="foo.value"></div>
```

Sets the text content of an element to the value of the signal. This is useful for setting the text content of an element to a signal value. Can use any expression that is valid in the system. For example, `data-text="foo.value + 'bar'"` would set the text content to the value of `foo.value` plus the string `bar`.

### On

```html
<button data-on-click="fn('foo','bar',1234)">Click Me</button>
```

Sets up an event listener on an element. The event listener will trigger the action specified in the expression. The expression can be any valid expression in the system. For example, `data-on-click="fn('foo','bar',1234)"` would trigger the action `fn` with the arguments `'foo','bar',1234` when the button is clicked.

If any signal in the expression changes, the event listener will be updated to reflect the new value of the signal automatically.

An `evt` variable that represents the event object is available in the expression.

```html
<div data-on-myevent="eventDetails.value=evt.detail"></div>
```

The `data-on` attribute matches DOM events, however there are currently a few special cases for custom events.

1.  `data-on-load` which is triggered when the element is loaded into the DOM.
2.  `data-on-signals-change` which is triggered when the signals changes.
3.  `data-on-raf` which is triggered on every `requestAnimationFrame` event.

#### Modifiers

- `__once`\* - Only trigger the event listener once
- `__passive`\* - Do not call `preventDefault` on the event listener
- `__capture`\* - Use a capture event listener
- `__debounce` - Debounce the event listener
  - `.1000ms` - Debounce for 1000ms
  - `.1s` - Debounce for 1s
  - `.leading` - Debounce with leading edge
  - `.noTrail` - Debounce without trailing edge
- `__throttle` - Throttle the event listener
  - `.1000ms` - Throttle for 1000ms
  - `.1s` - Throttle for 1s
  - `.noLeading` - Throttle without leading edge
  - `.noTrail` - Throttle without trailing edge
- `__window` - Attaches the event listener to the `window` element
- `__prevent` - Do not call `preventDefault` on the event listener
- `__stop` - Do not call `stopPropagation` on the event listener

\*only works currently on native events

### Class

```html
<div data-class-hidden="foo.value"></div>
```

```html
<div data-class="{'text-primary': primary.value, 'font-bold': bold.value}"></div>
```

Adds or removes each of the keys in the set of key-value pairs to the element’s class list, depending on whether the values evaluate to true or false, respectively.

### Persist

```html
<div data-persist></div>
```

Persists signals values in Local Storage. This is useful for storing values between page loads.

```html
<div data-persist="'foo bar'"></div>
```

If one or more values are provided, only those signals values will be persisted.

#### Modifiers

- `__session` - Persists signals values in Session Storage.

```html
<div data-persist-foo_session></div>
```
