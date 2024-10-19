## Redirects

## Demo

<div id="update" data-on-load="$$get('/examples/redirects/data')">
</div>

## Explanation

As part of SSE updates you may want to redirect the user to a different page. This can be done by returning a
```go
event: datastar-redirect
data: url /essays/grugs_around_fire
```

event from the server. The client will then redirect the user to the specified URL.  This can also be a full url such as `https://www.google.com`
