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
     <button
          class="btn btn-error"
          data-on-click="$$delete('/examples/update_store/data/patch')"
     >
          Remove 2 random
     </button>

     <pre
          class="border-2 border-accent bg-base-200 text-accent text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          data-text="JSON.stringify(ctx.store(),null,2)"
     >
          Stuff in store
     </pre>
</div>

## Explanation

This example demonstrates how to update the store directly from the frontend. This is using an SSE event

```text/event-stream
event: datastar-signal,
data: store { HYAAA4BK7IFQE: "2024-05-23T10:33:14.167189214-07:00", stuffAlreadyInStore: "this is already in the store"}
```
It will accept anything that is also accepted by the `data-store` attribute.


The deletion event looks like
```text/event-stream
event: datastar-delete,
data: paths 12768 stuffAlreadyInStore
```
Where the paths are `.` delimited paths within the store.  For a nested store it might look like `foo.bar.baz`.  Using the Go helpers for example this looks like `datastar.DeleteFromStore(sse, keysToDelete...)`
