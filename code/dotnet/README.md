# Datastar + dotnet

Real-time Hypermedia first Library and Framework for dotnet

# HTML Setup
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"></script>
```

# C# Usage
```csharp
using StarFederation.Datastar;
using StarFederation.Datastar.DependencyInjection;
...

// add as an ASP Service
//  allows injection of IServerSentEventGenerator, to respond to a request with a Datastar friendly ServerSentEvent
//                  and IDatastarStore, to read what is in the data-store of the client
builder.Services.AddDatastarGenerator<DataStore>();  // DataStore is a POCO with the IDatastarStore identifier interface
...

// add as an endpoint
app.MapGet("/get", async (IServerSentEventGenerator sse, IDatastarStore dsStore) =>
{
    // read back the DataStore
    DataStore store = (dsStore as DataStore) ?? throw new InvalidCastException("Unknown Datastore passed");
    DataStore newDataStore = store with { Output = $"Your Input: {store.Input}" };
    await sse.MergeFragments(
        $"<main class='container' id='main' data-store='{newDataStore.SerializeToJson()}'></main>",
        new MergeFragmentOpts() { MergeMode = FragmentMergeMode.UpsertAttributes }
        );
});
```
