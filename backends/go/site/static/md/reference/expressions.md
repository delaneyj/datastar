# Expressions

Expressions are the building blocks of Datastar. In fact, Datastar started as just a way to take `data-*` attributes and turn them into expressions. For exact `data-*` attribute found

1. All `Preprocesser` plugins are run. This allows for a custom DSL. The included plugins use `$` for signals, `$$` for actions, and `~` for refs. The plugins check for regular expressions and replace them with the appropriate value. Some plugins will setup extra state on load like adding CSS classes or setting up event listeners.
2. All Datastar `AttributePlugin` plugins are run in order. Most of the time these plugins are creating `effect()` signals so that that changes to the expression with automatically update the DOM and other parts of the system.
3. Check for any element removals and cancel any effects that are no longer needed.

Each expression is evaluated in a new Function declaration and not in a call to `eval()`. This is done to prevent access to the global scope and to prevent access to the `Function` constructor. This is done to prevent XSS attacks. Its also why all expressions take a `ctx` which has access to the store, actions, and refs, but not the global scope. This was gleamed from how Alpine.js works but with a different reactive model.
