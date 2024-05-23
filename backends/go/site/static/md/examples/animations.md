# Animations

[Original HTMX Version](https://htmx.org/examples/animations/)

# Explanation

Datastar is designed to allow you to use CSS transitions to add smooth animations and transitions to your web page using only CSS and HTML. Below are a few examples of various animation techniques.

Datastar also allows you to use the new View Transitions API for creating animations.

<div id="animations" data-on-load="$$get('/examples/animations/data')"></div>

## Basic CSS Animations

### Color Throb

<div>
<div id="color_throb">Color Throb Demo</div>
</div>

The simplest animation technique in Datastar is to keep the id of an element stable across a content swap. If the id of an element is kept stable, htmx will swap it in such a way that CSS transitions can be written between the old version of the element and the new one.

Consider this div:

```html
<div
  id="color_throb"
  class="transition-all duration-1000 font-bold text-2xl text-center rounded-box p-4 uppercase"
  style="background-color:#b57614;color:#83a598"
>
  blue on yellow
</div>
```

With SSE we just update the style every second:

### Smooth Progress Bar

The [Progress Bar](/examples/progress_bar) demo uses this basic CSS animation technique as well, by updating the `length` property of a progress bar element, allowing for a smooth animation.

## Swap Transitions

### Fade Out On Swap

<div id="fade_out_swap">Fade out swap Demo</div>

If you want to fade out an element that is going to be removed when the request ends, just send a SSE event with the opacity set to 0 and set a transition duration. This will fade out the element before it is removed.

## Settling Transitions

### Fade In On Addition

<div id="fade_me_in">Fade in Demo</div>

Building on the last example, we can fade in the new content the same way, starting from an opacity of 0 and transitioning to an opacity of 1.

## Request In Flight Animation

<div id="request_in_flight">Request in Flight Demo</div>

One of the nice features for reactivity is to show a spinner when a request is in flight. On any element that is using backend actions you can add a `data-indicator` attribute to show a spinner when the request is in flight. This can be done like so:

```html
<button
  data-fetch-indicator="'#request_in_flight_indicator'"
  data-on-click="$$post('/examples/animations/data/request_in_flight')"
  id="submit_request_in_flight"
>
  Submit
</button>
```

This will show the element with the id `request_in_flight_indicator` when the request is in flight and hide it when the request is complete.
