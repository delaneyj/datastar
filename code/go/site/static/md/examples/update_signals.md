## Update Signals

## Demo

<div
     data-merge-signals='{"existingSignals":"this already exists"}'
>
     <button
          class="btn btn-success"
          data-on-click="@post('/examples/update_signals/data/patch')"
     >
          Apply random signal
     </button>
     <button
          class="btn btn-error"
          data-on-click="@delete('/examples/update_signals/data/patch')"
     >
          Remove 2 random signals
     </button>

     <pre
          class="border-2 border-accent bg-base-200 text-accent text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          data-text="JSON.stringify(ctx.signals(),null,2)"
     >
          Stuff in signals
     </pre>
</div>

## Explanation

This example demonstrates how to update the signals using an SSE event.

```text/event-stream
event: datastar-merge-signals,
data: signals { HYAAA4BK7IFQE: "2024-05-23T10:33:14.167189214-07:00", existingSignals: "this already exists"}
```
It will accept anything that is also accepted by the `data-merge-signals` attribute.

The removal event looks like this:

```text/event-stream
event: datastar-remove-signals,
data: paths 12768 existingSignals
```

Where the paths are `.` delimited paths.  For nested signals it might look like `foo.bar.baz`.  Using the Go helpers for example this looks like `datastar.RemoveSignals(sse, keysToRemove...)`
