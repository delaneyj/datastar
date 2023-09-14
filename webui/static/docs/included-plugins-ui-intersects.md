[Back to Focus](/docs/included-plugins-ui-focus)

# Intersects

![ref](/static/images/intersects.gif)


```html
<div data-intersects.full="$count++"/>
```

When the element intersects the viewport, expression will be run as an effect.  This is useful for lazy loading images or loading more data when the user scrolls to the bottom of the page.

## Default
Run the effect when the element intersects as soon as any part of the element is visible.

## Modifiers

| Name | Description |
| --- | --- |
| `.once` | Only run the effect once. |
| `.half` | Only run the effect when the element is at least half visible. |
| `.full` | Only run the effect when the element is fully visible. |

[Next Teleport](/docs/included-plugins-ui-teleport)
