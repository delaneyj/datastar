# Animations

[Original HTMX Version](https://htmx.org/examples/animations/)

# Explanation
htmx is designed to allow you to use CSS transitions to add smooth animations and transitions to your web page using only CSS and HTML. Below are a few examples of various animation techniques.

htmx also allows you to use the new View Transitions API for creating animations.

<div
  data-fetch-url="'/examples/animations/data'"
    data-on-load="$$get"
  >
</div>

## Basic CSS Animations

### Color Throb
<div>
<div id="color_throb">Color Throb Demo</div>
</div>

The simplest animation technique in htmx is to keep the id of an element stable across a content swap. If the id of an element is kept stable, htmx will swap it in such a way that CSS transitions can be written between the old version of the element and the new one.

Consider this div:
```html
<style>
.smooth {
  transition: all 1s ease-in;
}
</style>
<div id="color-demo" class="smooth" style="color:red"
      hx-get="/colors" hx-swap="outerHTML" hx-trigger="every 1s">
  Color Swap Demo
</div>
```
This div will poll every second and will get replaced with new content which changes the color style to a new value (e.g. `blue`):
```html
<div id="color-demo" class="smooth" style="color:blue"
      hx-get="/colors" hx-swap="outerHTML" hx-trigger="every 1s">
  Color Swap Demo
</div>
```
Because the div has a stable id, `color-demo`, htmx will structure the swap such that a CSS transition, defined on the `.smooth` class, applies to the style update from `red` to `blue`, and smoothly transitions between them.

### Smooth Progress Bar
The [Progress Bar](/examples/progress_bar) demo uses this basic CSS animation technique as well, by updating the `length` property of a progress bar element, allowing for a smooth animation.

## Swap Transitions

### Fade Out On Swap


<div id="fade_out_swap">Fade out swap Demo</div>

If you want to fade out an element that is going to be removed when the request ends, you want to take advantage of the htmx-swapping class with some CSS and extend the swap phase to be long enough for your animation to complete. This can be done like so:


## Settling Transitions

### Fade In On Addition

<div id="fade_me_in">Fade in Demo</div>

Building on the last example, we can fade in the new content by using the htmx-added class during the settle phase. You can also write CSS transitions against the target, rather than the new content, by using the htmx-settling class.

## Request In Flight Animation

<div id="request_in_flight">Request in Flight Demo</div>

You can also take advantage of the `datastar-request` class, which is applied to the element that triggers a request.

