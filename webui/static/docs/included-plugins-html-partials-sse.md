[Back to Headers](/docs/included-plugins-html-partials-headers)

# Server Sent Events

![ref](/static/images/sse.gif)

```html
<div data-sse="`/api/flyers?foo=${$bar}`"/>
```

[Server sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) allow you to stream data from the server to the client.  This is useful for things like chat, notifications, and progress bars.  This plugin allows you to declaratively create a server sent event stream and merge the data into the element using the same rules as discussed in the [HTML Fragments](/docs/included-plugins-html-partials-fragments) plugin.  Each data response is a set of HTML fragments that are merged into elements.

HTMX has a similar extension but allows listening to filtered events, this plugin only listens to `message`.  If you are filtering you probably should be doing more work in the server side logic.


[Next Make our own Plugin](/docs/make-our-own-plugin)
