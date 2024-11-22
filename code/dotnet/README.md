# Datastar + dotnet

Real-time Hypermedia first Library and Framework for dotnet

# HTML Frontend
```html
<html lang="en">
<head>
    <script type="module" defer src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"></script>
    <title>D* Demo</title>
</head>
<body>
<main class="container" id="main" data-signals="{'input':'','output':''}">
    <button data-on-click="$get('/displayDate')">Display Date</button>
    <div id="target"></div>
    <input type="text" placeholder="input:" data-model="input"/><br>
    <span data-model="output"></span>
    <button data-on-click="$post('/changeOutput')">Change Output</button>
</main>
</body>
</html>
```

# C# Backend
```csharp
using StarFederation.Datastar;
using StarFederation.Datastar.DependencyInjection;
using System.Text.Json;
using System.Text.Json.Serialization;
...
// define your signals store
public record DatastarSignalsStore : IDatastarSignalsStore
{
    [JsonPropertyName("input")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Input { get; init; } = null;

    [JsonPropertyName("output")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Output { get; init; } = null;

    public string Serialize() => JsonSerializer.Serialize(this);
}
...
// add as an ASP Service
//  allows injection of IServerSentEventGenerator, to respond to a request with a Datastar friendly ServerSentEvent
//                  and IDatastarSignalsStore, to read what is in the data-signals of the client
builder.Services.AddDatastarGenerator<DatastarSignalsStore>();
...
// add endpoints
app.UseStaticFiles();

app.MapGet("/displayDate", async (IServerSentEventGenerator sse) =>
{
    string today = DateTime.Now.ToString("%y-%M-%d %h:%m:%s");
    await sse.MergeFragments($"""<div id='target'><span id='date'><b>{today}</b><button data-on-click="$get('/removeDate')">Remove</button></span></div>""");
});
app.MapGet("/removeDate", async (IServerSentEventGenerator sse) => { await sse.RemoveFragments("#date"); });
app.MapPost("/changeOutput", async (IServerSentEventGenerator sse, IDatastarSignalsStore dsStore) =>
{
    DatastarSignalsStore signalStore = (dsStore as DatastarSignalsStore) ?? throw new InvalidCastException("Unknown IDatastarSignalsStore passed");
    DatastarSignalsStore newSignalsStore = new() { Output = $"Your Input: {signalStore.Input}" };
    await sse.MergeSignals(newSignalsStore);
});
```
