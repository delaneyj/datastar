## Redirects

## Demo

<div id="update" data-on-load="$$get('/examples/redirects/data')">
     Replace me
</div>

## Explanation

As part of SSE updates you may want to redirect the user to a different page. This can be done by returning a `data: redirect` event from the server. The client will then redirect the user to the specified URL.
