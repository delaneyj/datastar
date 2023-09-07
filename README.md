# Datastar

# Not complete, there be <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 640 512"><path fill="currentColor" d="m352 124.5l-51.9-13c-6.5-1.6-11.3-7.1-12-13.8s2.8-13.1 8.7-16.1l40.8-20.4l-43.2-32.4c-5.5-4.1-7.8-11.3-5.6-17.9S297.1 0 304 0h160c30.2 0 58.7 14.2 76.8 38.4l57.6 76.8c6.2 8.3 9.6 18.4 9.6 28.8c0 26.5-21.5 48-48 48h-21.5c-17 0-33.3-6.7-45.3-18.7L480 160h-32v21.5c0 24.8 12.8 47.9 33.8 61.1l106.6 66.6c32.1 20.1 51.6 55.2 51.6 93.1c0 60.6-49.1 109.7-109.8 109.7H32.3c-3.3 0-6.6-.4-9.6-1.4c-9.2-2.8-16.7-9.6-20.3-18.5C1 488.7.2 485.2 0 481.4c-.2-3.7.3-7.3 1.3-10.7c2.8-9.2 9.6-16.7 18.6-20.4c3-1.2 6.2-2 9.5-2.2L433.3 412c8.3-.7 14.7-7.7 14.7-16.1c0-4.3-1.7-8.4-4.7-11.4l-44.4-44.4c-30-30-46.9-70.7-46.9-113.1V124.5zm160-52.2v-.6v.6zm-1.3 7.4l-46.4-11.6c-.2 1.3-.3 2.6-.3 3.9c0 13.3 10.7 24 24 24c10.6 0 19.5-6.8 22.7-16.3zm-379.8 36.8c16.3-14.5 40.4-16.2 58.5-4.1l130.6 87V227c0 32.8 8.4 64.8 24 93H112c-6.7 0-12.7-4.2-15-10.4s-.5-13.3 4.6-17.7l69.4-59.6l-152.6 23.5c-7 1.1-13.9-2.6-16.9-9S0 232.7 5.3 228l125.6-111.5z"/></svg> ahead.

</svg>
<img src="https://badgen.net/
bundlephobia/minzip/@sudodevnull/datastar@0.0.2
"/>
<img src="https://badgen.net/
bundlephobia/dependency-count/@sudodevnull/datastar@0.0.2
"/>
<img src="https://badgen.net/
bundlephobia/tree-shaking/@sudodevnull/datastar@0.0.2
"/>

Typescript library for making [hypermedia](https://hypermedia.systems/) systems using little to no Javascript code.

## Name?

Datastar is a play on the fact its using normal custom HTML attributes to do its magic.  These fall under the `data-*` attribute prefix

## Why?

I love what Caleb Porzio has done with Alpine.js and likewise with Carson Gross with HTMX.  However after trying to make extensions in both I got disappointed with the limitations.  Both are pure Javascript which is fine but leads to having to either keep the whole state in your head and or be prepared for lots of runtime errors.  Personally I think the best way to do this is to use Typescript and have the build step and compiler catch as many errors as possible.

### HTMX
A single 3700 LOC Javascript file.  There is an [entire HTMX Discord channel](https://discord.com/channels/725789699527933952/1077997241211568228) dedicated to my repeated effort to try to make the process of making extensions faster and more robust to write by moving to a typed system with a build step.  ***This was very unwanted and or unconvincing it's community*** (though many reached out in private with support).  There is a small but but very vocal part of the HTMX community that even when shown the issues will meme instead of rebut with facts or there own implementations.  Even went as far to port HTMX to Typescript and found 600+ assumptions about nullabity and types that were wrong.  This is not a knock on HTMX but just a statement of fact, my efforts were not persusaive and so better to move forward with a different approach.  HTMX is a great library and I will continue to use recommend it in certain situations.  However I think there is a better way to make extensions.  Even as large as it is (~3700 line single js file) it still need to add another library if there is any client side state.  By starting over and being more prescriptive we can a *much* smaller library that is easier to extend and use.

### Alpine.js + (Alpine-Ajax)
Alpine.js builds on Vue's reactivity layer; which is a virtual DOM.  However it doesn't have any of the benefits Vue gets from using a compile step to optimize in a hybrid way.  There are many magics and directives that aren't needed if you are doing backend driven apps (such as `x-for`, `x-if`, etc).  Directives results can't be queried by other directives and there are a lot of attachments of non-spec values on Elements (like `_x_dataStack`).  These are all fine for Alpine.js but I wanted to see if I could make a more declarative system that was more HTML compliant and easier to extend.

### Datastar
What surprised me is that by starting over and being more prescriptive I was able to make a library that is smaller, faster, and easier to extend.  I also think its easier to understand as most errors when creating new extensions are triggered at compile time.

## Features

### Pros
* 💯 strict Typescript with full tree shaking support
* 📦 0 dependencies
* The best parts of [Alpine.js](https://alpinejs.dev/) and [HTMX](https://htmx.org/) but created in a unique way to allow for a more declarative approach
* 💯 HTML compliant
* [Fine graine reactivity](https://dev.to/modderme123/super-charging-fine-grained-reactive-performance-47ph)
* Using [Vite](https://vitejs.dev/) for development and [Rollup](https://rollupjs.org/guide/en/) for production builds.
* **Everything** is an extension so you can add and remove features as needed
* Easy to use mock server for testing
* [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) stack ready with Go specific tooling coming soon
* Even will **all** extensions its very small (see badge above)
* Faster than Alpine.js VDOM reactivity and HTMX needs Hyperscript or Alpine to work on most real world projects

### Cons
* No **progressive enhancement**, you need Javascript enabled.  Datastar is for making realtime web apps like dashboards, admin panels, etc.  If you need progressive enhancement use [Alpine-Ajax](https://alpine-ajax.js.org/) or [HTMX](https://htmx.org/) and stick to just `<a/>` and `<form/>` tags.
* Modern browsers only (no IE11 support)
* Have to use custom attributes (data-*) so slightly more verbose but spec compliant always
* No SSE support yet (coming soon)
* Less memes and tweets
* No tests yet (but actively being used on an internal project).  Plan to use [Vitest](https://vitest.dev/)+[Playwright](https://playwright.dev/) soon
* Less examples
* [No book](https://hypermedia.systems/), but most of hypermedia concepts will port directly over.
* Uses evil Typescript to opress the masses with compile time constraint shackles and deny the freedom of the people to experience as many Javascript runtime errors as possible.

## Extensions

So far the following extensions are available.  More are coming as needed.

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
| signal    | Fine grained reactivity, used by most current extensions                                                         |
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

Just add this to your HTML file in head or body.  This will add all the extensions.
```html
<script src="https://unpkg.com/@sudodevnull/datastar"></script>
```

### Vite/Webpack/* with tree shaking


```typescript
import { addAllIncludedExtensions } from '@sudodevnull/datastar'

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

## Community

[Discord](https://discord.gg/6NkzNSjR)
