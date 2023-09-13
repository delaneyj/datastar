[Back to Plugins](/docs/overview-plugins)

# Keep your bad decisions local

![Sandbox](/static/images/sandbox.gif)

As the all might StackExchange says [eval is evil](https://softwareengineering.stackexchange.com/questions/311507/why-are-eval-like-features-considered-evil-in-contrast-to-other-possibly-harmfu) but the dirty secret is that any tool that's using HTML attributes or elements to define behavior is going to have to *evaluate* some dynamic code.  The key is to keep it as local as possible and make it as safe as possible.

Luckily modern Javascript has the concept of [sandboxed functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#sandboxed_execution_contexts) which allow you to create a function that can only access the variables you pass in.  Every plugin that needs to evaluate dynamic code uses a sandboxed function.  This means that the code is only evaluated in the context of the plugin and can't access anything else.  It also means you have to pass in a context that has both variables and functions that the code can access.

To make this simpler we have a plugin that is not tied to the HTML directly but does allow for registering of functions as ***actions*** within the context.  This is creates the ability to access any attached actions with the `@` prefix.  If you saw the example in the [overview](/docs/overview-declarative) you can see `@get` is used to make a request to the server.  This is a action that is registered with the `actions` within the html-fragments plugin.  Plugins build on other plugins to simplify the redundant code.

You don't have to deal with this directly, just be aware why `@actions` are a special flower, they live in a sandboxed environment to keep your bad decisions local.



[Next Events](/docs/included-plugins-core-events)