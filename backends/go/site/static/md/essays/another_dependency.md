# Another Dependency

Datastar is small, like really small. Even with all the plugins included it hovers between 10-12Kb minified+gzipped. One of the things that you might not know is how much of that is actually "external" dependencies.

![Datastar Dependencies](/static/images/essays/datastar_dependencies.png)

It accounts for over half of the size is actually the dependencies; let's break it down:

| Dependency                                                            | Usage                                                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **[ts-merge-patch](https://github.com/riagominota/ts-merge-patch)**   | is used by the core to merge the stores while matching RPC7396 for JSON Merge Patch.                  |
| **[json-bigint](https://github.com/Ivan-Korolenko/json-with-bigint)** | native JSON.parse/stringify don't support BigInts, this is a polyfill, hopefully some day its native. |
| **[preact-core](https://github.com/preactjs/signals)**                | Fine grained reactivity, used by the core to update the views.                                        |
| **[deep-signal](https://github.com/EthanStandel/deepsignal)**         | Forms the basis of the reactive store.                                                                |
| **[idiomorph](https://github.com/bigskysoftware/idiomorph)**          | Morph incoming HTML fragments into existing DOM, by same author as [HTMX](https://htmx.org/). [^1]    |
| **[fetch-event-source](https://github.com/Azure/fetch-event-source)** | Microsoft's take of using `text/event-stream` without EventSource API                                 |

These are all tiny and are probably better than anything I write myself. Also, they aren't included externally but live in the `/library/src/external` folder. This is because some weren't TypeScript and formatting wasn't consistent. It also makes it easier to debug and step through the code, while still getting tree-shaking out of the box. The only downside is any updates are manual, but that's a small price to pay for the benefits.

The latest dependency is [fetch-event-source](https://github.com/Azure/fetch-event-source). Since the EventSource API doesn't support non-GET requests and some other limitations, originally I thought I was clever and made my own implementation within the backend plugin. However, it was a bit of a mess when it came to error handling and reconnection and come to find out the Azure team had already done the majority of work. This library is a much better implementation.

I want to keep Datastar as small as possible, so I'm always on the lookout for better alternatives or ways to reduce the size.

If you have any suggestions, please let me know!

[^1]: It's also funny that Datastar is the only project I'm aware of that uses Idiomorph as it's merge strategy, even though it's by the same author as HTMX. I guess it's a bit of a hidden gem. It takes about 1/4 of Datastar's total size, but it is a very powerful tool that I don't see myself replacing anytime soon.
