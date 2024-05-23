## Update Store directly

## Demo

<div
     data-store='{"stuffAlreadyInStore":"this is already in the store"}'
>
     <button
          class="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600"
          data-on-click="$$post('/examples/update_store/data/patch')"
     >
          Apply random signal patch
     </button>
     <pre
          class="bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5"
          data-text="JSON.stringify(ctx.store(),null,2)"
     >
          Stuff in store
     </pre>
</div>

## Explanation

This example demonstrates how to update the store directly from the frontend. This is using a SSE event

```text/event-stream
event: datastar-signal,
data: { HYAAA4BK7IFQE: "2024-05-23T10:33:14.167189214-07:00", stuffAlreadyInStore: "this is already in the store"}
```

It will accept anything that is also accepted by the `data-store` attribute.
