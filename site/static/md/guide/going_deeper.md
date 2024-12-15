# Going Deeper

## Declarative Signals

At its core, Datastar makes __nestable signals declarative__. Let's unpack that (in reverse order).

### 1. Declarative

Declarative code is amazing. It allows you to simply request the result you want, without having to think about the steps required to make it happen.

Consider this non-declarative (imperative) way of conditionally placing a class on an element using JavaScript.

```js
if (foo == 1) {
  document.getElementById('myelement').classList.add('bold');
} 
else {
  document.getElementById('myelement').classList.remove('bold');
}
```

Datastar allows us to write this logic declaratively while embracing locality-of-behavior, by placing it on the element we want to affect.

```html
<div data-class-bold="foo.value == 1"></div>
```

### 2. Signals

Datastar uses signals, provided by [Preact Signals](https://preactjs.com/guide/v10/signals/), to manage state. You can think of signals as reactive variables that automatically track and propagate changes, from and to expressions. 

Signals can be created and modified using `data-*` attributes on the frontend, and using events sent from the backend. They can also be used inside of Datastar expressions.

```html
<div data-signals-foo="fizz"></div>
<div data-text="foo.value"></div>
<button data-on-click="foo.value = ''"></button>
```

In the example above, Datastar converts `foo.value` to `ctx.signals.foo.value`, and then evaluates the expression in a sandboxed context. This means that JavaScript can be used as part of the expression.

```html
<button data-on-click="foo.value = foo.value.toUpperCase()"></button>
```

### 3 Nestable Signals

Signals in Datastar have a superpower – they are nestable. This allows you to scope state as deeply as you like.

```html
<div data-signals-foo.bar="1" data-signals-foo.baz="2"></div>
```

Or, using object syntax:

```html
<div data-signals="{foo: {bar: 1, baz: 2}}"></div>
```

Or, using two-way binding:

```html
<input data-bind-foo.bar />
<input data-bind-foo.baz />
```

The beauty of this is that you don't need to write a bunch of code to set up and maintain state. You just use `data-*` attributes and think declaratively!

## Datastar Actions

Actions are helper functions that are available when using `data-on` attributes. They allow you to perform operations that can take expressions, without having to write a bunch of JavaScript.

```html
<button data-on-click="setAll('foo.', mysignal.value.toUpperCase()"></button>
```

### Backend Actions

The [`sse()`](/reference/action_plugins#sse) action sends a `fetch` request to the backend, and expects an event stream response containing zero or more [Datastar SSE events](/reference/sse_events). 

```html
<div data-on-click="sse('/endpoint')"></div>
```

SSE events can modify the DOM, modify signals, and execute JavaScript in the browser.

```
event: datastar-merge-fragments
data: fragments <div id="hello">Hello, world!</div>

event: datastar-merge-signals
data: signals {foo: {bar: 1}}

event: datastar-execute-script
data: script console.log('Success!')
```

Every request is sent with a `{datastar: *}` object containing the current signals (except for local signals whose keys begin with an underscore). This allows frontend state to be shared with the backend, and for the backend to “drive” the frontend.

## Hypermedia First

Datastar is a hypermedia framework. Hypermedia is the idea that the web is a set of interconnected resources, and it is the reason the web has been so successful. 

However, the rise of the frontend frameworks and SPAs have led to a lot of confusion about how to use hypermedia.

Browsers don't care about your application – they care about rendering hypermedia. For example, if you visit a membership website as a guest, you'll likely see a login option. Only once you log in will you see links to member-only content. This has huge benefits.

- Each interaction determined the next valid state.
- When implemented correctly, this means the backend is where all your logic lives, leading to no client side routing, validation, etc.
- HTML can be generated from any language.

## Simplicity

At 12 KiB, Datastar is smaller than both Alpine.js and htmx, yet it provides the functionality of both libraries combined. The package size is not _just_ a vanity metric. By embracing simplicity and first principles, everything becomes leaner and cleaner.

Don't take our word for it – go [browse the source code](https://github.com/starfederation/datastar/tree/main/library) and make up your own mind. And remember that Datastar is a framework, so while the [core plugins](https://github.com/starfederation/datastar/blob/main/library/src/plugins/official/core/attributes) are required, you can create [custom bundles](/bundler) and write your own plugins.

## Unlearning

When approaching Datastar, especially when coming from other frontend frameworks, be prepared to _unlearn_ your bad practices. You may not know them as bad practices; they may even feel natural to you.

When you embrace hypermedia, everything becomes much _less_ complicated. Put state in the right place, and it's a lot easier to reason about.