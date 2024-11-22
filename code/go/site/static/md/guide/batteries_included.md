# Batteries Included

## Build modular, think globally

Datastar was originally a branch of HTMX that was meant to make it more modular and easier to write plugins for. What was not expected is in creating what felt like essential plugins was actually able to recreate all the needed features of a full SPA frameworks, HTMX and Alpine and do it all in smaller package. While you can still build your own plugins, the core set of plugins is enough to build a full application. Let's explore some more features

## Evaluating data-\* attributes

Before we had used something like `data-text="$foo"` attribute. What this is actually doing under the hood is turning the string into a function that is evaluated safely into `(ctx)=> ctx.store.foo.value` where `ctx` is a Datastar object that gives a sandboxed context to the expression. In this case its connected directly to the contents of a signal, but you could do any Javascript that is valid. This also means you could evaluate to a constant string but that would look something like `data-text="'hello world'"`, notice the quotes, otherwise it would be looking for variable `hello world` which isn't valid and would fail to evaluate. This is the one major gotcha of declarative code, you have to be careful about the context. We aren't using `eval` but generating [sandboxed functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function) that are evaluated in a safe way similar to Alpine.js.

## More attributes

So far we've seen `data-store`, `data-model` and `data-text`. There are many more attributes that can be used to make your page more reactive. Check out the API for a full list of attributes but here are a few more that get used the most.

### `data-show`

This is a simple way to show and hide elements. It's a simple way to do `v-if` in Vue or `x-show` in Alpine.

```html
<div data-show="$foo">Hello World</div>
```

When the `foo` signal is truthy the div will be shown, otherwise it will be hidden.

### `data-on-*`

This is a way to add event listeners to elements. It's a simple way to do `v-on` in Vue or `x-on` in Alpine. Any valid `addEventListener` event type can be used. For example, `click`, `mouseover`, `dblclick`, etc.

```html
<button data-on-click="console.log('hello world')">Click me</button>
```

When the button is clicked it will log `hello world` to the console.

## Actions

Actions are helper functions that are made available during a `data-*` attribute evaluation. They are a way to do more complex operations without having to write a lot of javascript. Here are a few of the most common actions. They are prefixed with `$` to avoid any conflicts with other attributes.

### `$setAll`

Sometimes you want to set multiple values at once. It takes a prefix regexp and a set of signals. For example if you have a form with a bunch of inputs and you want to set them all at once you could do something like this.

```html
data-text="$setAll('contact_',true)`
```

### `$toggleAll`

Works the same as `$setAll` but will flip the value of the signals.

There can be many more actions and you can even write your own. But the majority of the time you'll be using the actions that allow for backend integration, which we'll cover in the next section.
