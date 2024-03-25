# Introduction

## Why another framework?

Javascript frameworks are a dime a dozen. So why did we create another one? The answer is simple: avoid writing any Javascript for the majority of use cases. The key value of the browser and web in general is the declarative nature of hypermedia.

```html
<div class="container">
  <img src="foo.img" />
</div>
```

Even if you've never coded before with a few examples your can create interconnect assets and it doesn't matter if you are a making a UI for bank or a simple blog. This has been true since the mid 90s, however many modern approaches such as async networking, data-binding, etc don't match the HTML language.

This has led to the rise of frontend frameworks such as React, Vue, Svelte, Solid, etc. In turn those were not enough for full application and led to full-stack Javascript frameworks like Next.js, Nuxt, Svelte and Solid Start. Once you need a framework for reactivity it makes sense to embrace it in the backend too for consistency.

Unfortunately this has led to a bit of cargo cult behavior. In reality almost all frameworks come down to the question of ...

> How can I update the DOM and fast and as simply as possible?

And Datastar's response to that is

1. Be declarative
2. Uses signals
3. Supply a set of plugins that handle 99% of problems

At first it started as just a plugin framework but found that by having no overlap in features you could replace any SPA framework and even hypermedia focused libraries like HTMX while being much smaller and we think easier to use.

If Datastar doesn't match your needs, you still might be interested in using it as originally intended [and write your own library](/reference/plugins).
