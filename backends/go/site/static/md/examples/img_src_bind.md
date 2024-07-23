## Demo

<div
    id="file_upload"
    data-store="{id:237, min: 1, max: 1024}"
>
    <img class="rounded ring-4 ring-accent" data-bind-src="`https://picsum.photos/id/${$id}/640/320`" />
    <input class="input input-bordered" type="number" step="1" data-bind-min="$min" data-bind-max="$max" data-model="id">
    <button class="btn btn-primary" data-on-click="$id = $$fitInt(Math.random(), 0, 1, $min, $max)">Random</button>
</div>

## Explanation

```html
<div
    id="file_upload"
    data-store="{id:237, min: 1, max: 1024}"
>
    <img data-bind-src="`https://picsum.photos/id/${$id}/640/320`" />
    <input type="number" step="1" data-bind-min="$min" data-bind-max="$max" data-model="id">
    <button data-on-click="$id = $$fitInt(Math.random(), 0, 1, $min, $max)">Random</button>
</div>
```

A discussion on the Discord channel found a bug in binding images.  This is an example to make sure it works going forward.  The bind of `src` to a template literal allows for a dynamic url and is hitting the picsum backend, not ours so no HTML fragments are needed.

The `$$fitInt` actions is a nice helper to simplify picking a random valid number.
