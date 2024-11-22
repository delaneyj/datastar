namespace StarFederation.Datastar.DependencyInjection

open System
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.DependencyInjection
open StarFederation.Datastar

[<System.Runtime.CompilerServices.Extension>]
type ServiceCollectionExtensionMethods() =

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastarGenerator (serviceCollection:IServiceCollection) =
        serviceCollection.AddHttpContextAccessor() |> ignore
        serviceCollection.AddScoped<IServerSentEventGenerator>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventGenerator(httpContext)
            )

    [<System.Runtime.CompilerServices.Extension>]
    static member AddDatastarGenerator<'T when 'T :> IDatastarStore> (serviceCollection:IServiceCollection) =
        serviceCollection.AddHttpContextAccessor() |> ignore
        serviceCollection.AddScoped<IServerSentEventGenerator>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventGenerator(httpContext)
            ) |> ignore

        serviceCollection.AddScoped<IDatastarStore>(fun (svcPvd:IServiceProvider) ->
            let httpContext = svcPvd.GetService<IHttpContextAccessor>()
            ServerSentEventGenerator(httpContext) |> ignore
            let result = ServerSentEventGenerator.ReadSignals<'T>(httpContext.HttpContext.Request).GetAwaiter().GetResult()
            match result with
            | ValueSome store -> store :> IDatastarStore
            | ValueNone -> failwith "Unable"
            ) |> ignore

        serviceCollection
