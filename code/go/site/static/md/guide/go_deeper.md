# Go Deeper

## Javascript Fatigue

Web development has become a technical occultism activity, in which the focus is on JavaScript and the capabilities of making HTML content dynamic instead of making a better job of delivering HTML. This has led to the rise of frontend frameworks such as React, Vue, Svelte, Solid, etc. In turn those were not enough for full application and progress led the industry to full-stack JavaScript frameworks like Next.js, Nuxt, Svelte and Solid Start. Once you need a framework for reactivity it makes sense to embrace it in the backend too for consistency.

In reality almost all frameworks come down to updating the DOM as fast and as simply as possible with some effort around improving developer experience.

## Philosophy

- **Be declarative**
- **Use signals**
- **Supply a set of plugins that handle 99% of problems**

Datastar started as just a plugin framework but found that by having no overlap in features, it was possible to replace any SPA framework and even hypermedia focused libraries like HTMX while being much smaller and _(we think)_ easier to use.

With Datastar, even if you have never coded before, with a few examples, you can easily create high interconnected web assets. It doesn't matter if you are a making a user interface for bank or a simple blog. The approach is simplicity through declarative HTML.

If Datastar doesn't match your needs, you still might be interested in using it as originally intended [and write your own library](https://github.com/starfederation/datastar/tree/main/packages/library/src/lib/plugins).

## Time to think declaratively

Declarative code is amazing.

```sql
SELECT *
FROM orders
WHERE state='completed'
ORDER BY time DESC
LIMIT 10
```

This is SQL. As a user you don't have to know how the query will get executed, it's up to the engine used. Sure you can read the query plan or introspect indexes, but you can start at a high level and drill down only when necessary.

HTML work in a similar fashion. You don't have to worry about how a `<div>Hello</div>` turned into pixels nor how the page uses resources when you tab away. This is wonderful for the majority of cases but at least in modern HTML is a bit limiting.

For example:

```html
...PSEUDO CODE..
<div>
  <label>HELLO WORLD</label>
  <input value="hello world" />
</div>
```

if you want to use the result of changing the input to modify the label you have to write code. What if we could extend HTML to make that process declarative? Well funny you ask...

## Custom data attributes

Luckily HTML5 has the concept of [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) which allows anyone to add their own attributes and still be valid HTML. The only real requirement is they be kebab-cased and start with `data-*`. Data star... that'd be a clever name... oh I get it!

Before we can actually use the `data-*` we need a quick aside about signals.

## Signals

Signals are a way to do fine grain reactivity in a very efficient way. They are similar to formulas in Excel. Instead of doing something like:

```js
let a = 2;
let b = 2;
let c = a * b;
console.log(c);
```

You can do:

```js
const a = signal(2);
const b = signal(2);
const c = computed(() => a() * b());
effect(() => {
  console.log(c());
});
```

The difference is if you change `a` or `b`, `c` will auto schedule for updates. So you spend your time declaring relationships more than procedures. They have been popularized by [Solid,js](https://www.solidjs.com/) but are now used by many frameworks.

## The Store

Ok so back to our hypothetical framework let's have a way to declare stuff that can setup signals on the page using `data-*` attributes.

```html
<div data-store="{value:'hello world'}"></div>
```

The contents are just a set of data that can evaluated

1. into a valid Javascript Object
2. converted into a tree of signals
3. merge into a store that tracks all the reactivity on the page.

In this case we want there to be a single `value` signal with the contents of `'hello world'`. Normally you'd have to write a bunch of code to make this happen but with Datastar you just add a `data-store` attribute and think declaratively.

## Models

Let's replace the hard coded value in the input with another attribute

```html
<div data-store="{value:'hello world'}">
  <label>HELLO WORLD</label>
  <input data-model="value" />
</div>
```

Here we've created a new attribute `data-model` with the contents of `value`. We are just saying when the signal `value` changes **or** input is edited on the page make sure you keep them in sync. We don't care how, just do it.

## Contents

Now we want to update the label relationship.

```html
<div data-store="{value:'hello world'}">
  <label data-text="$value"></label>
  <input data-model="value" />
</div>
```

Here we've added another attribute `data-text` but the content has a `$` prefix. Remember that `data-*` attributes _are just strings_, which means we can give any semantics we want as long as it's consistent. It this case we are designating the use of a signal by adding a `$` prefix. Now went the `value` signal updates, so will the `innerHTML` of the label. Pretty neat.

However, it doesn't yet match the original intent, which was to make it uppercase, so let's make a quick adjustment.

```html
<div data-store="{value:'hello world'}">
  <label data-text="$value.toUpperCase()"></label>
  <input data-model="value" />
</div>
```

So with this change and in a declarative nature you'd be able to extend HTML and focus on relationships.

Our HTML looks pretty neat but what would it take to make it actually work? Well just add:

```html
<script type="module" defer src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script>
```

somewhere on your page and it should **_just work_**. If you look at the dev tools of your browser you'll also see its tiny compared to any other full framework, and we haven't scratched the surface of what's included.

So far looking a lot like [Alpine.js](https://alpinejs.dev/) which is great, but as we add more features will diverge.
