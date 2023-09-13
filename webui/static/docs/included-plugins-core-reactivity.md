[Back to Plugins](/docs/overview-plugins)

# Gotta go fast

![HackTime](/static/images/hacktime.gif)

Almost all the current plugins build on the `data-signal` plugin.  This is a very simple plugin that allows you to define a signal with an initial value.  Similar to `x-data` in Alpine.js, however its defining a single signal instead of a whole context.  A more store like plugin is coming soon.

```html
<div data-signal-count="123">
```

To use this value in another element you can access the value with the `$` prefix.  The plugin includes a preprocessor that will replace the value with the current value of the signal.

```html
<div data-text="$count">
```
Will auto update to as the count signal changes.  Under the hood an effect is created which tracks the changes.  Not you can use this syntax in any data attribute.

Also note that a stack is created so you can have signals defined in parent available to children.  This is very useful for things like forms.

```html
<div data-signal-count="123">
  <div>
    <button data-on-click="$count++">
      Increment +
    </button>
    <button data-on-click="$count--">
      Decrement -
    </button>
    <input type="number" data-model="count" />
  </div>
</div>
```

This is using extra plugins but you can see how you can build complex applications with very little code.

## Caveats

The underlying contents of the signal have to be replaced for the effect to fire.  This means if you used for an array you have to replace the entire array.

```html
❌ Does not trigger effect
<button data-signal="[0,1,2]" data-on-click="$count.push(3)">Modify</button>

✅ Triggers effect
<button data-signal="[0,1,2]" data-on-click="$count = [...$count, 3]">Modify</button>
```
This will rarely be an issue but its something to be aware of.  In a SPA or more client driven app its a easy foot gun because so much state lives in the browser.  Since we are just sprinkling in some reactivity into a normal HTML page this is less of an issue.

## Under the hood

Under the hood its using [Reactively](https://github.com/modderme123/reactively) to create a reactive context.   While reactively tries to unify the `Reactive<T>` into a unified API it still has gotchas.  We expose as
```ts
export declare type Reactivity = {
    signal<T>(initialValue: T): Reactive<T>;
    computed<T>(fn: () => T): Reactive<T>;
    effect(fn: () => void): Reactive<void>;
    onCleanup(fn: () => void): void;
};
```
to make it a bit more universal and allow for other reactive libraries to be used without a complete rewrite.  If you are new to signals [this article](https://dev.to/modderme123/super-charging-fine-grained-reactive-performance-47ph) does a great job of explaining the concept.

Signals manipulate the DOM directly and this implementation never overdraws.  Another alternative is to use a virtual DOM like Alpine.JS does (actually uses Vue's reactivity layer).  The issue is Vue has a compiler and can do a hybrid model to be really fast.  Vue's already working on a ***vapor-mode*** which will use signals under the hood.  This is a great idea and I think it will be a great addition to the Vue ecosystem.  However I think the declarative nature of HTML is a better fit for the web.

[Next Sandboxed Functions](/docs/included-plugins-core-sandboxed-functions)