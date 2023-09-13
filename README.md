# Datastar

![bg](./docs/static/bg.jpg)

Typescript library for making [hypermedia](https://hypermedia.systems/) systems using little to no Javascript code.  The Typescript may be important to the datastar dev but its just a normal JS file to the browser.  The goal is to make it easy to create realtime web apps with as little Javascript as possible.  This is done by using HTML attributes to define the behavior of the page.  This is similar to [Alpine.js](https://alpinejs.dev/) + [HTMX](https://htmx.org/) but with a few key differences.

# What does it look like?

```html
<div data-signal-count="0">
  <div>
    <button data-on-click="$count++">
      Increment +
    </button>
    <button data-on-click="$count--">
      Decrement -
    </button>
    <input type="number" data-model="count" />
  </div>
  <button
    data-signal-get="'/api/echo'"
    data-on-load="@get"
    data-on-click="@get"
  >
    Contents
  </button>
</div>
```
It's just normal [HTML data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) that get watched by plugins and build up a context object.  The current plugins work off of signals to make everything reactive and allow *very* fast interactions in very little code.

# Not complete, there be 🐉

![Size](https://badgen.net/bundlephobia/minzip/@sudodevnull/datastar@0.0.2)
![Dependencies](https://badgen.net/bundlephobia/dependency-count/@sudodevnull/datastar@0.0.2)
![Tree shaking support ](https://badgen.net/bundlephobia/tree-shaking/@sudodevnull/datastar@0.0.2)

## Community

Lives as a channel in the EventGraph Discord server.  Feel free to join and ask questions.
![Discord](https://dcbadge.vercel.app/api/server/6NkzNSjR)


## Features

### Pros
* 💯 strict Typescript with full tree shaking support
* 📦 0 dependencies
* The best parts of [Alpine.js](https://alpinejs.dev/) and [HTMX](https://htmx.org/) but created in a unique way to allow for a more declarative approach
* 💯 HTML compliant
* [Fine grain reactivity](https://dev.to/modderme123/super-charging-fine-grained-reactive-performance-47ph)
* Using [Vite](https://vitejs.dev/) for development and [Rollup](https://rollupjs.org/guide/en/) for production builds.
* **Everything** is an plugin so you can add and remove features as needed
* Easy to use mock server for testing
* [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) stack ready with Go specific tooling coming soon
* Even with **all** plugins its very small (see badge above)
* Faster than Alpine.js [VDOM](https://vuejs.org/guide/extras/rendering-mechanism.html) reactivity and HTMX needs [Hyperscript](https://hyperscript.org/reference/) or Alpine to work on most real world projects
* [DHH would hate it](https://news.ycombinator.com/item?id=37405565)

### Cons
* Syntax is still very much in flux, but will stabilize with usage
* **No progressive enhancement**, you need Javascript enabled.  Datastar is for making realtime web apps like dashboards, admin panels, etc.  If you need progressive enhancement use [Alpine-Ajax](https://alpine-ajax.js.org/) or [HTMX](https://htmx.org/) and stick to just `<a/>` and `<form/>` tags.  Scripting is a first class citizen in hypermedia systems.
* Modern browsers only (no IE11 support)
* Have to use custom attributes (data-*) so slightly more verbose but spec compliant always
* No SSE support yet (coming soon)
* Less memes and tweets
* No tests yet (but actively being used on an internal project).  Plan to use [Vitest](https://vitest.dev/)+[Playwright](https://playwright.dev/) soon
* Documentation is on its way
* [No book](https://hypermedia.systems/), but most of hypermedia concepts will port directly over.

## Plugins

So far the following plugins are available.  More are coming as needed.

| Name      | Description                                                                                                        |
|-----------|--------------------------------------------------------------------------------------------------------------------|
| actions   | Adds support for `@action` which is a sandboxed function call similar to an Alpine $magic but *only* for functions |
| bind      | Allows signals to be bound to attributes on a element                                                              |
| focus     | Focus an element, use when returning a fragment of HTML                                                            |
| fragments | Adds `@get`,`@delete`,`@put`,`@post`,`@patch` actions.  Usually used within on `data-on-*` attribute               |
| headers   | data-header-foo="bar" will add { FOO: "bar"} to fragment calls                                                     |
| intersect | Uses intersection observer to trigger a function when an element is in view                                        |
| model     | Two way binding for form elements to signals                                                                       |
| on        | Adds support for `data-on-*` attributes to call functions.  Includes debounce,throttle,etc                         |
| signal    | Fine grained reactivity, used by most current plugins                                                         |
| teleport  | Move elements around the DOM, mostly for modals                                                                    |
| text      | Update text content of an element                                                                                  |

## Installation

```bash
pnpm i
pnpm dev // for development and kitchen sink demo.
pnpm build // for production
```

## Usage

### CDN

Just add this to your HTML file in head or body.  This will add all the plugins and hook them up.
```html
<script src="https://unpkg.com/@sudodevnull/datastar@0.0.4/dist/datastar.iife.js"></script>
```

### Vite/Webpack/* with tree shaking


```typescript
import { addAllIncludedPlugins } from '@sudodevnull/datastar'

addAllIncludedPlugins()
```
If you look at that `addAllIncludedPlugins` its just calling all the current plugins.  You can add them individually if you want.


### Mock Server

Learning from Alpine Ajax we can use a mock server available in the browser to test out the basics.  Note Datastar is primarily targets at HOWL stack development.  This means you can use it with any server that can serve HTML and receive JSON.  The mock server is just for testing.

If you want to use the mock server you can add this after...
```typescript
import { injectMockFetch } from '@delaneyj/datastar'

injectMockFetch({
  '/api/echo': {
    GET: async (req) => {
      const queryString = req.url.split('?')[1]
      const searchParams = new URLSearchParams(queryString)
      const dsJSON = searchParams.get('dataStack')
      if (!dsJSON) throw new Error('No dataStack found in query params')
      const dataStack = JSON.parse(dsJSON)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        html: `
      <pre data-swap="after">${JSON.stringify(dataStack, null, 2)}</pre>
      <div id="foo">Bar</div>
      `,
      }
    },
  },
})
```

## Name?

Datastar is a play on the fact its using normal custom HTML attributes to do its magic.  These fall under the `data-*` attribute prefix



## Why?

I love what Caleb Porzio has done with Alpine.js and likewise with Carson Gross with HTMX.  However after trying to make plugins in both I got disappointed with the limitations.  Both are pure Javascript which is fine but leads to having to either keep the whole state in your head and or be prepared for lots of runtime errors.  Personally I think the best way to do this is to use Typescript and have the build step and compiler catch as many errors as possible.  Plus it makes it easier to extend and create optimized builds.

### Why not just use Vue/React/Svelte?

[HTMX Essays](https://htmx.org/essays/) are a great place to start.

### Why not just use HTMX+Alpine?

There was a bit of a rant here before.  TL;DR tried to show HTMX v2 could do all these things and it wasn't accepted by the community.  I think HTMX is great and I will continue to recommend it.  In general I think the some of the choices are throwing the baby out with the bathwater when it comes to things like Vite/TS/etc.