## Sortable

[Original HTMX Version](https://htmx.org/examples/sortable/)

## Demo

<div class="flex flex-col gap-8" data-store="{orderInfo:''}" data-on-store-change="$orderInfo?.length > 0 && console.log(`You could send this to the server! ${$orderInfo}`)">
  <div class="text-lg">Order Info: <span class="font-bold" data-text="$orderInfo">Order Info</span></div>
  <div>Open your console to see an event results</div>
  <div id="sortContainer" class="flex flex-col gap-4">
    <div class="bg-primary text-primary-content p-4 rounded-box">Item 1</div>
    <div class="bg-primary text-primary-content p-4 rounded-box">Item 2</div>
    <div class="bg-primary text-primary-content p-4 rounded-box">Item 3</div>
    <div class="bg-primary text-primary-content p-4 rounded-box">Item 4</div>
    <div class="bg-primary text-primary-content p-4 rounded-box">Item 5</div>
  </div>
  <script type="module" src="/static/js/sortable.js"></script>
</div>

### Explanation

In the original example you had to hook into HTMX's events.  With Datastar you already have signals to effect change.

<div class="alert alert-warning">
  <iconify-icon icon="mdi:warning"></iconify-icon>
  Normally you should keep your JS logic in webcomponents.  You can access Datastar directly even if we don't recommend it. It's an option if you are dealing with legacy applications, but even then use sparingly.
</div>

```html
<div 
  data-store="{orderInfo:''}" 
  data-on-store-change="$orderInfo?.length > 0 && console.log(`You could send this to the server! ${$orderInfo}`)"
>
  <div>OrderInfo: <span data-text="$orderInfo">Order Info</span></div>
  <div id="sortContainer">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
    <div>Item 5</div>
  </div>
  <script type="module" src="/static/js/sortable.js"></script>
</div>
```

The HTML looks pretty straightforward.  Create an `orderInfo` signal and when it has data fire off an event.

I've separate out the js content to avoid Markdown escaping in this example
```js
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/+esm'

const sortContainer = document.getElementById('sortContainer')

new Sortable(sortContainer, {
    animation: 150,
    ghostClass: 'opacity-25',
    onEnd: (evt) => {
        if (!window.ds) throw new Error('Datastar is not defined')
        const orderInfo = ds.signalByName('orderInfo')
        orderInfo.value = `Moved from ${evt.oldIndex} to ${evt.newIndex}`
    }
})
```
Here we are grabbing the Datastar object directly and updating the signal.

Anything you can do in HTMX or Alpine should be possible in Datastar.

