# Datastar

Typescript library for making [hypermedia](https://hypermedia.systems/) systems using little to no Javascript code.

## Name?

Datastar is a play on the fact its using normal custom HTML attributes to do its magic.  These fall under the `data-*` attribute prefix

## Why?

I love what Caleb Porzio has done with Alpine.js and likewise with Carson Gross with HTMX.  However after trying to make extensions in both I got disappointed with the limitations.  Both are pure Javascript which is fine but leads to having to either keep the whole state in your head and or be prepared for lots of runtime errors.  Personally I think the best way to do this is to use Typescript and have the build step and compiler catch as many errors as possible.

### HTMX
A single 3700 LOC Javascript file.  There is an entire channel dedicated to my violent effort to try to make the process of making extensions faster and more robust to write by moving to a typed system with a build step.  ***This was treated as very unwanted***.  There is a small but very vocal part of the HTMX community that even when shown the issues will meme instead of rebut with facts or there own implementations.  Even went as far to port HTMX to Typescript and found 400+ assumptions about nullabity and types that were wrong.  This is not a knock on HTMX but just a statement of fact.  HTMX is a great library and I will continue to use recommend it in certain situations.  However I think there is a better way to make extensions.  Even as large as it is it still need to add another library if there is any client side state.  By starting over and being more prescriptive we can a *much* smaller library that is easier to extend and use.

### Alpine.js + (Alpine-Ajax)
Alpine.js builds on Vue's reactivity layer, which is a VDOM.  However it doesn't have any of the benefits Vue gets from using a compile step to optimize in a hybrid way.  Also there are many magics and directives that aren't needed if you are doing backend driven apps (such as `x-for`, `x-if`, etc).  Directives results can't be queried by other directives and there are a lot of attachments of non-spec values on Elements (like `_x_dataStack`).  These are all fine for Alpine.js but I wanted to see if I could make a more declarative system that was more HTML compliant and easier to extend.

### Datastar
What surprised me is that by starting over and being more prescriptive I was able to make a library that is smaller, faster, and easier to extend.  I also think its easier to understand as most errors when creating new extensions are triggered at compile time.

## Features

### Pros
* 💯 strict Typescript with full tree shaking support
* 📦 0 dependencies
* Best parts of [Alpine.js](https://alpinejs.dev/) and [HTMX](https://htmx.org/) but created in a unique way to allow for a more declarative approach
* 💯 HTML compliant
* [Fine graine reactivity](https://dev.to/modderme123/super-charging-fine-grained-reactive-performance-47ph)
* Using [Vite](https://vitejs.dev/) for development and [Rollup](https://rollupjs.org/guide/en/) for production builds.
* Everything is an extension so you can add and remove features as needed
* Easy to use mock server for testing
* [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) stack ready with Go specific tooling coming soon
* Even will **all** extensions its currently sitting at ***<8kb*** brotli compressed
* Faster than Alpine.js VDOM reactivity and HTMX needs Hyperscript or Alpine to work on most real world projects

### Cons
* No **progressive enhancement**, you need Javascript enabled.  Datastar is for making realtime web apps like dashboards, admin panels, etc.  If you need progressive enhancement use Alpine=Ajax or HTMX and stick to just `<a/>` and `<form/>` tags.
* Modern browsers only (no IE11 support)
* Have to use custom attributes (data-*) so slightly more verbose than but spec compliant
* No SSE support yet (coming soon)
* Less memes
* Less examples
* [No books](https://hypermedia.systems/)

## Installation

```bash
pnpm i
pnpm dev // for development
pnpm build // for production
```

## Usage

### Simple

There will be a zero build version but for now...
```typescript
import { addAllIncludedExtensions } from '@delaneyj/datastar'

addAllIncludedExtensions()
```
If you look at that `addAllIncludedExtensions` its just calling all the current extensions.  You can add them individually if you want.


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

