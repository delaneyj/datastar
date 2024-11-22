using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;
using StarFederation.Datastar;
using StarFederation.Datastar.DependencyInjection;

namespace CsharpAspServer;

public record DataStore : IDatastarStore
{
    [JsonPropertyName("input")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Input { get; init; } = null;

    [JsonPropertyName("output")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Output { get; init; } = null;

    [JsonPropertyName("show")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? Show { get; init; } = null;
    public string SerializeToJson() => JsonSerializer.Serialize(this);
}

public static class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Services.AddDatastarGenerator<DataStore>();

        WebApplication app = builder.Build();
        app.UseDefaultFiles(new DefaultFilesOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "..", "Shared", "wwwroot")),
        });
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "..", "Shared", "wwwroot")),
        });

        app.MapGet("/language/{lang:required}", (string lang, IServerSentEventGenerator sse) => sse.MergeFragments($"""<span id="language">{lang}</span>"""));
        app.MapGet("/get", async (IServerSentEventGenerator sse, IDatastarStore dsStore) =>
        {
            DataStore store = (dsStore as DataStore) ?? throw new InvalidCastException("Unknown Datastore passed");
            DataStore newDataStore = store with { Output = $"Your Input: {store.Input}" };
            await sse.MergeFragments(
                $"<main class='container' id='main' data-store='{newDataStore.SerializeToJson()}'></main>",
                new MergeFragmentOpts() { MergeMode = FragmentMergeMode.UpsertAttributes }
                );
        });
        app.MapGet("/patch", async (IServerSentEventGenerator sse, IDatastarStore dsStore) =>
        {
            DataStore store = (dsStore as DataStore) ?? throw new InvalidCastException("Unknown Datastore passed");
            DataStore mergeSignals = new() { Output = $"Patched Output: {store.Input}" };
            await sse.MergeSignals(mergeSignals.SerializeToJson());
        });
        app.MapGet("/target", async (IServerSentEventGenerator sse) =>
        {
            string today = DateTime.Now.ToString("%y-%M-%d %h:%m:%s");
            await sse.MergeFragments($"""<div id='target'><b>{today}</b><button data-on-click="$get('/removeTarget')">Remove</button></div>""");
        });
        app.MapGet("/feed", async (IHttpContextAccessor acc, IServerSentEventGenerator sse, CancellationToken ct) =>
        {
            try
            {
                while (!ct.IsCancellationRequested)
                {
                    long rand = Random.Shared.NextInt64(1000000000000000000, 5999999999999999999);
                    await sse.MergeFragments($"<span id='feed'>{rand}</span>");
                    await Task.Delay(TimeSpan.FromSeconds(1), ct);
                }
            }
            finally
            {
                try { acc?.HttpContext?.Connection.RequestClose(); } catch { }
            }
        });
        app.MapGet("/removeTarget", (IServerSentEventGenerator sse) => sse.RemoveFragments("#target"));
        app.MapGet("/clickRocket", (IServerSentEventGenerator sse) => sse.Console(ConsoleMode.Info, "You clicked the rocket!"));
        app.MapGet("/redirect", (IServerSentEventGenerator sse) => sse.Redirect("https://data-star.dev"));


        app.Run();
    }
}
