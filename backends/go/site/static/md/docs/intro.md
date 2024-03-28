# Introduction

## Why another framework?

Javascript frameworks are a dime a dozen. So why did we create another one? The answer is simple: avoid writing any JavaScript for the majority of use cases. The key value of the browser and web is the declarative nature of hypermedia. It just got buried.

```html
<div class="container">
  <img src="foo.img" />
</div>
```

Web development has become a technical occultism activity, in which the focus is on JavaScript and the capabilities of making HTML content dynamic instead of making a better job of delivering HTML. This JavaScript religion has led to the rise of frontend frameworks such as React, Vue, Svelte, Solid, etc. In turn those were not enough for full application and progress led the industry to full-stack JavaScript frameworks like Next.js, Nuxt, Svelte and Solid Start. Once you need a framework for reactivity it makes sense to embrace it in the backend too for consistency.

In reality almost all frameworks come down to updating the DOM as fast and as simply as possible with some effort around improving developer experience.

Datastar's philosophy and response to to this industry position is:

1. Be declarative
2. Use signals
3. Supply a set of plugins that handle 99% of problems

Datastar started as just a plugin framework but found that by having no overlap in features, it was possible to replace any SPA framework and even hypermedia focused libraries like HTMX while being much smaller and *(we think)* easier to use.

With Datastar, even if you have never coded before, with a few examples, you can easily create high interconnected web assets. It doesn't matter if you are a making a user interface for bank or a simple blog. The approach is simplicity through declarative HTML.

If Datastar doesn't match your needs, you still might be interested in using it as originally intended [and write your own library](/reference/plugins).
