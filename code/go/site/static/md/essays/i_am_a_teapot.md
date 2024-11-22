# 418 I'm a teapot

A discussion on the [HTMX Discord](https://discord.com/channels/725789699527933952/1156332851093065788) started talking about HTTP status codes. Apparently I hold the minority opinion that if

1. Are using HTTP as your UI interface
2. Humans are using your UI
3. You are using [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/)
4. Have complete control over the backend

Then you should only **_ever_** be usings either the 2xx or 3xx series of status codes. The 4xx and 5xx series are for machines and should never be seen by humans. The 4xx series is for client errors and the 5xx series is for server errors. If you are using HTTP as your UI interface then you should be handling all errors on the client side. If you are using a 4xx or 5xx series code then you are doing something wrong.

[This](https://discord.com/channels/725789699527933952/1156332851093065788/1156377394530242622) section is the most relevant:

> **@alex** — What if the user enters a URL they don't have access to?
>
> **@delaneyj** — then you redirect them or create a you aren't allowed page no?
>
> **@Deniz A. (dz4k)** —
>
> ```
> HTTP/1.1 200 OK
> Content-Type: text/html
> <H1>Error 404</H1>
> ```
>
> **@alex** — Great solution, no notes

It might be a little tongue in cheek but the point is valid. If you are using HTTP as your UI interface then you should be using the 2xx and 3xx series of status codes. If you are using the 4xx or 5xx series then you are doing something wrong.

## Hypermedia is for humans

The whole point of [HOWL](https://htmx.org/essays/hypermedia-on-whatever-youd-like/) is to make your UI driven by HATEOAS and users do not care about the underlying protocol. Redirecting a users or explaining why they aren't authorized then it should be done in the UI. If you need to expose an API there are far more efficient and explicit ways to do that such as [gRPC](https://grpc.io/), [dRPC](https://docs.drpc.org/), or [Buf's Connect](https://buf.build/blog/connect-a-better-grpc). If that's too limiting then you can always go to a distributed highly available super-cluster via [NATS](https://nats.io/).

## What does Datastar do?

If it's a 3xx we redirect, 2xx we merge the HTML fragment, and anything else throws an error. I'm considering even forcing a `window.alert` on top of throwing the error. If you get at client error or server error **_when you control both sides_** then it's a bug, and you should be fixing it.

![Full Stack Error Handling](/static/images/essays/fullstack.jpg)
