# Why another framework?

## What's different?

There are many things I find wonderful about Alpine.js and HTMX. However there are a few things that I think could be improved. The biggest challenge it both is plugins (called `directives`/`magic` in Alpine and `extensions` in HTMX). I tried writing in both of them as was disappointed by the breadth of monkey patching and lack of type safety. In general you don't have access to what other plugins do nor can you build a DAG of dependencies. This means you have to be very careful about the order you load plugins and what they do. This is especially true if you want to use a plugin in a plugin. I think this is a big problem and I wanted to solve it. Because Datastar started with the notion **_EVERYTHING_** is a plugin you could theoretically build both Alpine and HTMX inside of Datastar. I don't think that is a good idea but it is possible.

Beyond that I want the backend to be the _source of truth_ when it comes to state. [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) is a great way to structure your applications but you still need some client side state. Datstar does not use FormData; it lacks the ability to define nested data structures simply. So in general you send up JSON (automatically) and down HTML. This is more prescriptive than HTMX, but again this is with just the included plugins. You can build your own plugins to do whatever you want.

## Background

I love what [Caleb Porzio](https://calebporzio.com/) has done with [Alpine.js](https://alpinejs.dev/) and likewise with [Carson Gross](https://bigsky.software/cv/) with [HTMX](https://htmx.org/). However after trying to make extensions in both I got disappointed with the limitations. Both are pure Javascript which is fine but leads to having to either keep the whole state in your head and or be prepared for lots of runtime errors. Personally I think the best way to do this is to use Typescript and have the build step and compiler catch as many errors as possible. Plus it makes it easier to extend and create optimized builds.

### Why not just use Vue/React/Svelte?

[HTMX Essays](https://htmx.org/essays/) are a great place to start.

### Why not just use HTMX+Alpine?

There was a bit of a rant here before. TL;DR I tried to show that HTMX v2 could do all these things and it wasn't accepted by the community. I think HTMX is great and I will continue to recommend it. In general I think that some of the choices are throwing the baby out with the bathwater when it comes to things like Vite/TS/etc. The good news is that everything I, and some other lurkers wanted is available in Datastar or can be added easily via plugins.

[Let's move on to the docs and see what Datastar can do](/examples)
