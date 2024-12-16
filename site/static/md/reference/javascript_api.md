# JavaScript API

Datastar intentionally does not (indecently) expose itself in the global scope – you _should_ be able to do everything you need via `data-*` attributes.

For edge-cases where you find yourself having to change the DOM without involving Datastar, you can import Datastar and apply it to any element and its children.

```html
<script type="module">
    import { Datastar } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js'
    
    Datastar.apply(document.body)
</script>
```

## Public Methods

The Datastar object exposes the following methods.

### `apply()`

Applies all plugins to the provided element and its children.

```js
Datastar.apply(document.body)
```

### `load()`

Loads all plugins and applies them to the DOM.

```js
Datastar.load()
```

## Public Properties

The Datastar object exposes the following properties.

### `signals`

The signal root, on which you can access signal methods. Beware that you should avoid using this for anything other than troubleshooting.

```js
Datastar.signals.values()
```

### `version`

The current version number.

```js
Datastar.version
```