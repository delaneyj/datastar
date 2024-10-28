# Streaming Backend

HTMX is amazing for resurrecting the server rendered web. In general its far easier and faster than SPA development but there are still a few issues.

- For any larger page you have to add [hyperscript](https://hyperscript.org/) or [Alpine.js](https://alpinejs.dev/) to make the page reactive.
- There are multiple ways to target the elements on the page with `hx-target` and [out of band swaps](https://htmx.org/attributes/hx-swap-oob/). This if flexible but leads to a ton of ways to do the same thing.
- Responses are still single responses. If you want to have multiple updates as soon as possible you need to use plugins that aren't well-supported (at this time).
- The list of `hx-*` attributes is growing quickly and think it points to a bigger issue with scope.

None of these are deal-breakers but starting from first principles we can do better. The first thing we need to do is make the page reactive. We can do this by using [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) or [Websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). We'll use version of SSE because

- At the end of the day its "just" an HTTP request. All your sessions, cookies, etc. are still valid.
- Websockets are harder to deal with depending on sticky sessions and load balancers.
- Websockets aren't compatible with HTTP2/3. Datastar will probably move to [WebTransport](https://web.dev/webtransport/) when its more available (looking at you Apple).
- HTTP2/3 is already multiplexed so you can have multiple SSE streams open at once.

## SSE

If you aren't familiar with SSE it's a way to create a chunked response to the browser. The browser will automatically reconnect if the connection is lost. The server can also send a `retry` header to tell the browser how often to reconnect. The browser will also automatically reconnect if the connection is lost. The nice part of having a chunked response is you can send multiple updates or a single update and the browser will handle it. Any modern backend HTTP server framework should allow for easy SSE support (it's just a few headers and a specific text format for content).

## SSE backend, fetch on the frontend

For a reason that I still haven't figured out, the SSE spec and [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) only supports GET requests. This seems like a huge oversight, but we can work around it. From the backend's perspective they can send a `Content-Type: text/event-stream` from any request. This means we can use a normal `fetch` request to get the SSE stream. The only downside is we have to manually handle the reconnects. This is handled by Datastar, but it's good to be aware of.

## Let's get some data

On the [click to edit example](/examples/click_to_edit) when you first load the page the contents is basically empty.

```html
<div
  id="contact_1"
  data-on-load="$$get('/examples/click_to_edit/contact/1')"
></div>
```

Normally you don't need to do this but its trying to show that you can load a page and then have the data update. The `$$get` action is a helper function that will make a fetch request and update the store with the results. The `datastar-indicator` class is a helper class that will show a spinner when the request is in flight.

On the backend (Go in this case) we return a set of render fragments in the form of a set of `text/event-stream` events. In this case it's just a single event.

```go
event: datastar-fragment
id: 129618219840307262
data: selector
data: merge morph
data: settle 0
data: fragment <div ...>...</div>


```

The `selector` is the CSS selector that the fragment will be inserted into. The `merge` decides how the element is added to the page. `morph` uses [idiomorph](https://github.com/bigskysoftware/idiomorph) to merge into the page intelligently. The `settle` is the time in milliseconds that the fragment will be inserted. The `fragment` is the HTML that will be inserted into the page. If you are familiar with HTMX and the structure of SSE messages this should look quite familiar. Nice thing is most of these are optional (except for `fragment`) and can be optionally added to the response. In the case of the Go implementation it includes all for the sake of completeness.

This is still a lot to explore but the main point is that we can have a reactive page without having to write any Javascript. This is the power of declarative code. I'd suggest you check out the [examples](/examples) to see how this all fits together. Then when you have a specific question check out the [reference](/reference) for more details.

# Conclusion

Please don't hesitate to reach out if you have any questions. We are always looking for feedback and ways to improve. If you are interested in contributing please check out the [GitHub](https://github.com/delaneyj/datastar)

# Choose your own adventure

<div class="flex justify-center gap-4">
<a href="/examples" role="button" class="no-underline btn ">Show me</a>
<a href="/reference" role="button" class="no-underline btn ">Let me dig in</a>
<a href="/essays" role="button" class="no-underline btn ">Pontificating</a>
</div>
