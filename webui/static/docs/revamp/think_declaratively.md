# Time to think declartively

Declarative code is amazing.

```sql
SELECT *
FROM orders
WHERE state='completed'
ORDER BY time DESC
LIMIT 10
```

This is SQL code.  As a user you don't have to know how the query will get executed, its up to the engine used.  Sure you can read the query plan or introspect indexes but you can start at a high level and drill down only when necessary.

HTML work in a similar fashion.  You don't have to worry about how a `<div>Hello</div>` turned into pixels nor how the page uses resources when you tab away.  This is wonderful for the majority of cases but at least in modern HTML is a bit limiting.

For example

```html
...PSEUDO CODE..
<div>
    <label>HELLO WORLD</label>
    <input value="hello world"/>
</div>
```
if you want to use the result of changing the input to modify the label you have to write code.  What if we could extend HTML to make that process declarative?  Well funny you ask...

## Custom data attributes

Luckily HTML5 has the concept of [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) which allows anyone to add there own attributes and still be valid HTML.  The only real requirement is they be kebab-cased and start with `data-*`.  Data star... that'd be a clever name... oh I get it!


Befor we can actually use the `data-*` we need a quick aside about signals.

## Signals

Signals are a way to do fine grain reactivity in a very efficient way.  They are similar to formulas in Excel.  Instead of doing something like
```js
let a = 2
let b = 2
let c = a * b
console.log(c)
```

You can do
```js
const a = signal(2)
const b = signal(2)
const c = computed(()=> a() * b())
effect(()=> {
    console.log(c())
})
```
The difference is if you change `a` or `b`, `c` will auto schedule for updates.  So you spend your time declaring relationships more than procedures.  They have been popularized by [Solid,js](https://www.solidjs.com/) but are now used by many frameworks.


# The store

Ok so back to our hypothecial framework let's have a way to declare stuff that can setup signals on the page using `data-*` attributes.
```html
<div data-merge-store="{value:'hello world'}">
```
The contents is just a set of data that can evaluated by [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) and will convert this data into a tree of signals and merge into a singleton store of all reactivity on the page.  In this case we want there to be a a single `value` signal withe the contents of `'hello world'`.

# Models

Let's replace the hard coded value in the input with another attribute

```html
<div data-merge-store="{value:'hello world'}">
    <label>HELLO WORLD</label>
    <input data-model="value"/>
</div>
```

Here we've created a new attribute `data-model` with the contents of `value`.  We are just saying when the signal `value` changes **or** input is edited on the page make sure you keep them in sync.  We don't take how, just do it.

# Contents

Now we want to update the label relationship.

```html
<div data-merge-store="{value:'hello world'}">
    <label data-text="$value"></label>
    <input data-model="value"/>
</div>
```

Here we've added another attribute `data-text` but the content has a `$` prefix.  Remember that `data-*` attributes *are just strings*, which means we can give any semantics we want as long as it's consistent.  It this case we are designating the use of a signal by adding a `$` prefix.  Now went the `value` signal updates, so will the `innerHTML` of the label.  Pretty neat.

However it doesn't yet make the original intent, which was to make it uppercase, so let's make a quick adjustment.

```html
<div data-merge-store="{value:'hello world'}">
    <label data-text="$value.toUpperCase()"></label>
    <input data-model="value"/>
</div>
```
So with this change and in a declartive nature you'd be able extend HTML and focus on relationships.


Our HTML looks pretty neat but what would it take to make it actuall work?  Well just add
```html
<script src="
https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@0.7.0/dist/datastar.min.js
"></script>```
```
somewhere on your page and it should ***just work***.  If you look at the dev tools of your browser you'll also see its tiny compared to any framework and we haven't scratched the surface of what's included.

So far looking a lot like [Alpine.js](https://alpinejs.dev/) which is great, but as we add more features will diverge.
