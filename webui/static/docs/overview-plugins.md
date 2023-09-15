[Back to Declarative](/docs/overview-declarative)

# Everything is a plugin

![Plugin](/static/images/plugin.gif)

## Welcome to Datastar NEO

What's included in the box (so far) is a very prescriptive set of plugins that allow you to build reactive web apps with very little code.  It expects almost all logic to live in either normal HTML multi-page apps or delivered via partial HTML snippets set from the server.

For example in Alpine.js you have `x-for` and `x-if` but they act as templating engines.  In Datastar don't need that because the server should have already rendered the HTML for you.  Alpine.js originally didn't have `x-for` and I think it was better off without it.  To each there own but we are trying to build a different kind of system, one that lands even closer to the ideals [Hypermedia.Systems](https://hypermedia.systems/) laid out so thoughtfully.

## No more monkey patching

Alpine.js and HTMX both monkey patch the DOM to make things work.  This is fine but it makes it hard to extend and build plugins.  Datastar uses the native HTML5 `data-*` attributes (hence the name) to define the behavior of the page.  This means you can extend any plugin and even build your own plugins without having to worry about breaking other plugins.

## Types matter

We are unapologetically Typescript first.  This means you get full type safety and tree shaking support.  This means you can build your own plugins and have them work with the core plugins.  This also means you get compile time errors and better IDE support.  While still early I think the type system has already paid off any extra complexity.  The contract for plugins is clear and you can build your own plugins with confidence.  Right now any function that calls

```ts
addDataPlugin(
  prefix: string,
  args: {
    allowedTags?: Iterable<string>
    allowedModifiers?: Iterable<string | RegExp>
    isPreprocessGlobal?: boolean
    preprocessExpressions?: Iterable<Preprocesser>
    withExpression?: (args: WithExpressionArgs) => NamespacedReactiveRecords | void
    requiredPlugins?: Iterable<string>
  },
)
```

is a valid Datastar plugin.  We will be adding more documentation on this soon.  But rest assured you can build your own plugins and have them work with the core plugins with ease.

The `withExpression` optional argument is the most complicated part with the most power.
```ts
export declare type WithExpressionArgs = {
    name: string;
    expression: string;
    el: Element;
    dataStack: NamespacedReactiveRecords;
    reactivity: Reactivity;
    withMod(label: string): Modifier | undefined;
    hasMod(label: string): boolean;
    actions: ActionsMap;
};
```
which gives you direct control over exactly how the data attribute strings are processed.  This is how we can build plugins like `signal` and `model` that are so powerful and in dozens to at most hundreds of lines of code.

Speaking of which...

[Next Reactivity](/docs/included-plugins-core-reactivity)