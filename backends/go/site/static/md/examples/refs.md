## Refs

## Demo

<div>
     <div data-ref="foo">I'm a div that is getting referenced</div>
     <pre
          class="bg-accent border-2 border-accent text-accent text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          data-text="JSON.stringify(ctx.store(),null,2)"
     >
          Stuff in store
     </pre>
     <div data-text="`I'm using content of '${(~foo).innerHTML}'`">
</div>

## Explanation

```html
<div>
  <div data-ref="foo">I'm a div that is getting referenced</div>
  <div data-text="`I'm using content of '${(~foo).innerHTML}'`"></div>
</div>
```

By adding `data-ref="foo"` to an element, you can reference it in other Datastar attribute expressions. It automatically creates a valid selector that can be used in other actions on the page.

**Note:** The parentheses around `~foo` are required to ensure that the reference is properly evaluated. We can't discern between a property and a nested signal without them.

**Note:** Every element that has any Datastar plugins associated with it will automatically create an `id` attribute if it doesn't already have one. This is to ensure that the element can be referenced in cleanup steps.
