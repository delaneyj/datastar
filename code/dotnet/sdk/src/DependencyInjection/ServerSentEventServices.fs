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

    let datastarServiceWithCustomDeserializer<'T when 'T :> IDatastarSignalsStore> (signalStoreDeserializer:string -> 'T) (serviceCollection:IServiceCollection) =
        serviceCollection.AddHttpContextAccessor() |> ignore

        serviceCollection.AddScoped<IServerSentEventService>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventService(httpContext)
            ) |> ignore

        serviceCollection.AddScoped<IDatastarSignalsStore>(fun (svcPvd:IServiceProvider) ->
            let httpContextAccessor = svcPvd.GetService<IHttpContextAccessor>()
            let rawSignals = ServerSentEventHttpHandler.ReadRawSignalStore(httpContextAccessor.HttpContext.Request).GetAwaiter().GetResult()
            match rawSignals with
            | Ok rawSignals' -> signalStoreDeserializer(rawSignals')
            | Error _ -> signalStoreDeserializer("{}")
            ) |> ignore

        serviceCollection

    let datastarService<'T when 'T :> IDatastarSignalsStore> (serviceCollection:IServiceCollection) =
        datastarServiceWithCustomDeserializer JsonSerializer.Deserialize<'T> serviceCollection

[<System.Runtime.CompilerServices.Extension>]
type ServiceCollectionExtensionMethods() =

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar serviceCollection =
        ServerSentEventServices.datastarServiceWithoutSignals serviceCollection

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar<'T when 'T :> IDatastarSignalsStore> serviceCollection =
        ServerSentEventServices.datastarService<'T> serviceCollection

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastar<'T when 'T :> IDatastarSignalsStore> (serviceCollection:ServiceCollection, signalsStoreDeserializer:Func<string, 'T>) =
        ServerSentEventServices.datastarServiceWithCustomDeserializer<'T> signalsStoreDeserializer.Invoke serviceCollection
