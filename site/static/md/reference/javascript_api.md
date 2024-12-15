# JavaScript API

Datastar intentionally does not (indecently) expose itself in the global scope – you _should_ be able to do everything you need via `data-*` attributes.

For edge-cases where you find yourself having to change the DOM without involving Datastar, you can import Datastar and apply it to any element and its children.

```html
<script type="module">
    import { Datastar } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js'
    
    Datastar.apply(document.body)
</script>
```