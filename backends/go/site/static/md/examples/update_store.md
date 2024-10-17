## Update Store directly

## Demo

<div
     data-store='{"stuffAlreadyInStore":"this is already in the store"}'
>
     <button
          class="btn btn-success"
          data-on-click="$$post('/examples/update_store/data/patch')"
     >
          Apply random signal patch
     </button>
     <pre
          class="border-2 border-accent bg-base-200 text-accent text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          data-text="JSON.stringify(ctx.store(),null,2)"
     >
          Stuff in store
     </pre>
</div>

## Explanation

This example demonstrates how to update the store directly from the frontend. This is using a SSE event

```text/event-stream
event: datastar-signal,
data: store { HYAAA4BK7IFQE: "2024-05-23T10:33:14.167189214-07:00", stuffAlreadyInStore: "this is already in the store"}
```

It will accept anything that is also accepted by the `data-store` attribute.
