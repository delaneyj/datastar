# Visibility Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/packages/library/src/lib/plugins/visibility.ts)

Focused on showing and hiding elements based on signals. Most of the time you want to send updates from the server but is useful for things like modals, dropdowns, and other UI elements.

## Attributes Plugins

### Show

```html
<div data-show="$showMe"></div>
```

Shows the element when the expression is true.

#### Modifiers

- `.duration`* - Duration for the show animation 
  - `_1000ms` - Duration for 1000ms

*default is 300ms if duration value not provided

### Intersects

```html
<div data-intersects="console.log('I am intersecting!')"></div>
```

Runs the expression when the element intersects with the viewport.

#### Modifiers

- `.once` - Only trigger the event once
- `.half` - Trigger when half of the element is visible
- `.full` - Trigger when the full element is visible

### Teleport

```html
<div data-teleport="#foo"></div>
```

Moves the element to the target.

#### Modifiers

- `.prepend` - Prepend the element to the target
- `.append` - Append the element to the target

### Scroll Into View

```html
<div data-scroll-into-view></div>
```

Scrolls the element into view. Useful when updating DOM from the server, and you want to scroll to the new content.

#### Modifiers

- `.smooth` - Scrolling should be animate smoothly
- `.instant` - Scrolling should be instant
- `.auto` - Scrolling is determined by the computed `scroll-behavior` CSS property
- `.hstart` - Scroll to the left of the element
- `.hcenter` - Scroll to the horizontal center of the element
- `.hend` - Scroll to the right of the element
- `.hnearest` - Scroll to the nearest horizontal edge of the element
- `.vstart` - Scroll to the top of the element
- `.vcenter` - Scroll to the vertical center of the element
- `.vend` - Scroll to the bottom of the element
- `.vnearest` - Scroll to the nearest vertical edge of the element
- `.focus` - Focus the element after scrolling

### View Transition

```html
<div data-view-transition="foo"></div>
```

Page level transitions are automatically handled by an injected meta tag. Inter-page elements are automatically transitioned if the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) is available. To set the `view-transition-name` style attribute explicitly you use the `data-view-transition` attribute. The spec is still in draft and not available in all browsers but Datastar will do best effort.

When sending many Datastar messages in a small period of time it is often recommended to not perform view-transitions as it can make elements unresponsive. You can always [turn them off](/reference/plugins_backend#data-fragment) on a per-message basis.
