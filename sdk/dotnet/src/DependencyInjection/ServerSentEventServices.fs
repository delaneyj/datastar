namespace StarFederation.Datastar.DependencyInjection

open System
open System.Text.Json
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.DependencyInjection
open StarFederation.Datastar

module ServerSentEventServices =

    let datastarServiceWithoutSignals (serviceCollection:IServiceCollection) =
        serviceCollection.AddHttpContextAccessor() |> ignore

        serviceCollection.AddScoped<IServerSentEventService>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventService(httpContext)
            ) |> ignore

        serviceCollection

    let datastarServiceWithCustomDeserializer<'T when 'T :> IDatastarSignals> (signalDeserializer:string -> 'T) (serviceCollection:IServiceCollection) =
        serviceCollection.AddHttpContextAccessor() |> ignore

        serviceCollection.AddScoped<IServerSentEventService>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventService(httpContext)
            ) |> ignore

        serviceCollection.AddScoped<IDatastarSignals>(fun (svcPvd:IServiceProvider) ->
            let httpContextAccessor = svcPvd.GetService<IHttpContextAccessor>()
            let rawSignals = ServerSentEventHttpHandler.ReadRawSignals(httpContextAccessor.HttpContext.Request).GetAwaiter().GetResult()
            match rawSignals with
            | Ok rawSignals' -> signalDeserializer(rawSignals')
            | Error _ -> signalDeserializer("{}")
            ) |> ignore

        serviceCollection

    let datastarService<'T when 'T :> IDatastarSignals> (serviceCollection:IServiceCollection) =
        datastarServiceWithCustomDeserializer JsonSerializer.Deserialize<'T> serviceCollection

[<System.Runtime.CompilerServices.Extension>]
type ServiceCollectionExtensionMethods() =

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar serviceCollection =
        ServerSentEventServices.datastarServiceWithoutSignals serviceCollection

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar<'T when 'T :> IDatastarSignals> serviceCollection =
        ServerSentEventServices.datastarService<'T> serviceCollection

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar<'T when 'T :> IDatastarSignals> (serviceCollection:ServiceCollection, signalsDeserializer:Func<string, 'T>) =
        ServerSentEventServices.datastarServiceWithCustomDeserializer<'T> signalsDeserializer.Invoke serviceCollection
