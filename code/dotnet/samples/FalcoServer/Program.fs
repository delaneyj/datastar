
open System
open System.Text.Json
open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.FileProviders
open Microsoft.AspNetCore.Builder
open StarFederation.Datastar
open StarFederation.Datastar.DependencyInjection
open StarFederation.Datastar.Falco
open global.Falco
open Falco.Routing
open Falco.HostBuilder

type Signals = { input: string; output: string; show: bool }
    with
    static member defaults = { input = ""; output = ""; show = false }
    interface IDatastarSignals with
        member this.Serialize () = JsonSerializer.Serialize(this)

[<EntryPoint>]
let main args =

    webHost args {

        use_middleware (fun appBuilder ->
            let webAppBuilder = appBuilder :?> WebApplication
            let defaultFileOptions = DefaultFilesOptions()
            defaultFileOptions.FileProvider <- new PhysicalFileProvider(System.IO.Path.Combine(webAppBuilder.Environment.ContentRootPath, "..", "Shared", "wwwroot"))
            let staticFileOptions = StaticFileOptions()
            staticFileOptions.FileProvider <- new PhysicalFileProvider(System.IO.Path.Combine(webAppBuilder.Environment.ContentRootPath, "..", "Shared", "wwwroot"))
            webAppBuilder.UseDefaultFiles(defaultFileOptions).UseStaticFiles(staticFileOptions)
            )

        add_service (ServerSentEventServices.datastarServiceWithCustomDeserializer<Signals>( JsonSerializer.Deserialize<Signals> ))

        endpoints [
            get "/" (Response.redirectTemporarily "index.html")
            get "/language/{lang:required}"
                (Request.mapRoute
                    (fun route -> route.GetString "lang")
                    (fun lang -> Response.sseMergeFragments (fun _ -> $"""<span id="language">{lang}</span>"""))
                    )
            get "/patch" (Response.sseMergeSignals (fun signals -> { signals with output =  $"Patched Output: {signals.input}" } ))
            get "/target" (Response.sseMergeFragments (fun _ ->
                let today = System.DateTime.Now.ToString("%y-%M-%d %h:%m:%s");
                $"""<div id='target'><span id='date'><b>{today}</b><button data-on-click="@get('/removeDate')">Remove</button></span></div>"""
                ))
            get "/removeDate" (Response.sseRemoveFragments (fun _ -> "#date"))
            get "/feed" (Response.sseGenerator (fun ctx sseService signals -> task {
                let requestCanceled = ctx.RequestAborted
                while (requestCanceled.IsCancellationRequested |> not) do
                    let rand = Random.Shared.NextInt64(1000000000000000000L, 5999999999999999999L);
                    do! sseService.MergeFragments $"<span id='feed'>{rand}</span>"
                    do! Task.Delay(TimeSpan.FromSeconds 1, requestCanceled)
                }))
        ]
    }
    0
