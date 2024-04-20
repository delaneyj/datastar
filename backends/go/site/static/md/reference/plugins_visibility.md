# Visibility Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/library/src/lib/plugins/visibility.ts)

Focused on showing and hiding elements based on signals. Most of the time you want to send updates from the server but is useful for things like modals, dropdowns, and other UI elements.

## Attributes Plugins

### Show

```html
<div data-show="$showMe"></div>
```

Shows the element when the expression is true.

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

Scrolls the element into view. Useful when updating DOM from the server and you want to scroll to the new content.

### View Transition

```html
<div data-view-transition="foo"></div>
```

Page level transitions are automatically handled by an injected meta tag. Inter-page elements are automatically transitioned if the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). To set phe `view-transition-name` style attribute explictily you use the `data-view-transition` attribute. The spec is still in draft and not available in all browsers but Datastar will do best effort.
