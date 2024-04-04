# Core Plugins

[Source](https://github.com/delaneyj/datastar/blob/main/library/src/lib/plugins/core.ts)

These are the only plugins that are required in order to have a working system. In the default build all (including core) plugins are included as they cover the most common use cases.

## Attributes Plugins

### MergeStore

```html
<div data-store="{foo:1234}"></div>
```

Takes the contents of the attribute and runs a BigInt aware JSON parse on it. It then merges the contents into the store. This can be used anywhere as the store is a global singleton. All keys are converted into signals, works with nested objects.

### Ref

```html
<div data-ref="foo"></div>
```

Makes an element available in the `ctx.refs` object. This is useful for accessing elements in the DOM. Can be accessed in scripts via `~foo`.

## Preprocessor Plugins

### SignalProcessor

Takes a `$var` and converts into a `ctx.store().var.value`. Since all expressions are evaluated within an effect it setups of a reactive system.

### ActionProcessor

Takes a `$$fn('foo','bar',1234)` and converts into a `ctx.actions.fn('foo','bar',1234()`. This is used to trigger actions plugins.

### RefProcessor

Takes a `~foo` and converts into a `ctx.refs.foo`. This is used to access refs similar to how you would in a Vue or Svlete components.
