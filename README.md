# Datastar

![bg](./docs/static/bg.jpg)

Typescript library for making [hypermedia](https://hypermedia.systems/) systems using little to no Javascript code. The Typescript may be important to the datastar dev but its just a normal JS file to the browser. The goal is to make it easy to create realtime web apps with as little Javascript as possible. This is done by using HTML attributes to define the behavior of the page. This is similar to [Alpine.js](https://alpinejs.dev/) + [HTMX](https://htmx.org/) but with a few key differences.

[Official Site](https://data-star.dev/)

It's just normal [HTML data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) that get watched by plugins and build up a context object. The current plugins work off of signals to make everything reactive and allow _very_ fast interactions in very little code.

# Not complete, there be 🐉

![Size](https://badgen.net/bundlephobia/minzip/@sudodevnull/datastar@0.8.0)
![Dependencies](https://badgen.net/bundlephobia/dependency-count/@sudodevnull/datastar@0.8.0)
![Tree shaking support ](https://badgen.net/bundlephobia/tree-shaking/@sudodevnull/datastar@0.8.0)

## Community

Lives as a channel in the EventGraph Discord server. Feel free to join and ask questions.
[![](https://dcbadge.vercel.app/api/server/CHvPMrAp6F)](https://discord.gg/CHvPMrAp6F) #datastar channel

## Features

### Pros

- 💯 strict Typescript with full tree shaking support
- 📦 0 dependencies
- The best parts of [Alpine.js](https://alpinejs.dev/) and [HTMX](https://htmx.org/) but created in a unique way to allow for a more declarative approach
- 💯 HTML compliant
- [Fine grain reactivity](https://dev.to/modderme123/super-charging-fine-grained-reactive-performance-47ph)
- Using [Vite](https://vitejs.dev/) for development and [Rollup](https://rollupjs.org/guide/en/) for production builds.
- **Everything** is an plugin so you can add and remove features as needed
- [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) stack ready with Go specific tooling coming soon
- Even with **all** plugins its very small (see badge above)
- Faster than Alpine.js [VDOM](https://vuejs.org/guide/extras/rendering-mechanism.html) reactivity and HTMX needs [Hyperscript](https://hyperscript.org/reference/) or Alpine to work on most real world projects
- [DHH would hate it](https://news.ycombinator.com/item?id=37405565)

### Cons

- Syntax is still very much in flux, but will stabilize with usage
- **No progressive enhancement**, you need Javascript enabled. Datastar is for making realtime web apps like dashboards, admin panels, etc. If you need progressive enhancement use [Alpine-Ajax](https://alpine-ajax.js.org/) or [HTMX](https://htmx.org/) and stick to just `<a/>` and `<form/>` tags. Scripting is a first class citizen in hypermedia systems.
- Modern browsers only (no IE11 support)
- Have to use custom attributes (data-\*) so slightly more verbose but spec compliant always
- No SSE support yet (coming soon)
- Less memes and tweets
- No tests yet (but actively being used on an internal project). Plan to use [Vitest](https://vitest.dev/)+[Playwright](https://playwright.dev/) soon
- Documentation is on its way
- [No book](https://hypermedia.systems/), but most of hypermedia concepts will port directly over.

### Why not just use Vue/React/Svelte?

[HTMX Essays](https://htmx.org/essays/) are a great place to start.

### Why not just use HTMX+Alpine?

There was a bit of a rant here before. TL;DR tried to show HTMX v2 could do all these things and it wasn't accepted by the community. I think HTMX is great and I will continue to recommend it. In general I think the some of the choices are throwing the baby out with the bathwater when it comes to things like Vite/TS/etc.
