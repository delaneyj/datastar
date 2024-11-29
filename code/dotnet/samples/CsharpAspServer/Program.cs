using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;
using StarFederation.Datastar;
using StarFederation.Datastar.DependencyInjection;

namespace CsharpAspServer;

public record DataSignalsStore : IDatastarSignals
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

    public string Serialize() => JsonSerializer.Serialize(this);
}

public static class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Services.AddDatastar<DataSignalsStore>();

        WebApplication app = builder.Build();
        app.UseDefaultFiles(new DefaultFilesOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "..", "Shared", "wwwroot")),
        });
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "..", "Shared", "wwwroot")),
        });

        app.MapGet("/", (context) =>
        {
            context.Response.Redirect("index.html");
            return Task.CompletedTask;
        });
        app.MapGet("/language/{lang:required}", (string lang, IServerSentEventService sseService) => sseService.MergeFragments($"""<span id="language">{lang}</span>"""));
        app.MapGet("/patch", async (IServerSentEventService sseService, IDatastarSignals dsStore) =>
        {
            DataSignalsStore signalsStore = (dsStore as DataSignalsStore) ?? throw new InvalidCastException("Unknown Datastore passed");
            DataSignalsStore mergeSignalsStore = new() { Output = $"Patched Output: {signalsStore.Input}" };
            await sseService.MergeSignals(mergeSignalsStore);
        });
        app.MapGet("/target", async (IServerSentEventService sseService) =>
        {
            string today = DateTime.Now.ToString("%y-%M-%d %h:%m:%s");
            await sseService.MergeFragments($"""<div id='target'><span id='date'><b>{today}</b><button data-on-click="@get('/removeDate')">Remove</button></span></div>""");
        });
        app.MapGet("/removeDate", (IServerSentEventService sseService) => sseService.RemoveFragments("#date"));
        app.MapGet("/feed", async (IHttpContextAccessor acc, IServerSentEventService sseService, CancellationToken ct) =>
        {
            try
            {
                while (!ct.IsCancellationRequested)
                {
                    long rand = Random.Shared.NextInt64(1000000000000000000, 5999999999999999999);
                    await sseService.MergeFragments($"<span id='feed'>{rand}</span>");
                    await Task.Delay(TimeSpan.FromSeconds(1), ct);
                }
            }
            finally
            {
                try { acc?.HttpContext?.Connection.RequestClose(); } catch { }
            }
        });

        app.Run();
    }
}
