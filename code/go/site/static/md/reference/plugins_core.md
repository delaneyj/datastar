# Core Plugins

[Source](https://github.com/starfederation/datastar/blob/main/packages/library/src/lib/plugins/official/core.ts)

These are the only plugins that are required in order to have a working system. In the default build all (including core) plugins are included as they cover the most common use cases.

## Attributes Plugins

### Signals

```html
<div data-merge-signals="{foo:1234}"></div>
```

Takes the contents of the attribute and runs a BigInt aware JSON parse on it. It then merges the contents into the signals. This can be used anywhere as the signals is a global singleton. All keys are converted into signals, works with nested objects.

<div class="alert alert-info">
    <div>
        Note that `value` and `peek` are reserved words (imposed by the signals library) and cannot be used as signals names.
    </div>
</div>

#### Modifiers

- `.ifmissing` - Only set the signals if the key does not exist. This is useful for setting defaults without overwriting existing values.

### Computed

```html
<div data-computed-blinker="$count % 2 === 0"></div>
```

Allows you to define a computed signals value that automatically updates its value based on an expression. This can be used to drive other reactive behaviors, such as updating classes or text content in the DOM.

### Ref

```html
<div data-ref="foo"></div>
```

Makes an element available as a signal in the signals.

## Preprocessor Plugins

### SignalProcessor

Takes a `$var` and converts into a `ctx.signals().var.value`. Since all expressions are evaluated within an effect it setups of a reactive system.

### ActionProcessor

Takes a `$fn('foo','bar',1234)` and converts into a `ctx.actions.fn('foo','bar',1234()`. This is used to trigger actions plugins.

### RefProcessor

Takes a `~foo` and converts into a `ctx.refs.foo`. This is used to access refs similar to how you would in a Vue or Svelte components.
