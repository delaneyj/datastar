module StarFederation.Datastar.Falco.Response

open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open StarFederation.Datastar
open StarFederation.Datastar.DependencyInjection

let sseMergeFragments<'T when 'T :> IDatastarSignalsStore> (fragment:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignalsStore>) :?> 'T
    sseService.MergeFragments (fragment signalsStore)

let sseRemoveFragments<'T when 'T :> IDatastarSignalsStore> (selector:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignalsStore>) :?> 'T
    sseService.RemoveFragments (selector signalsStore)

let sseMergeSignals<'T when 'T :> IDatastarSignalsStore> (newSignalsStore:'T -> IDatastarSignalsStore) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignalsStore>) :?> 'T
    sseService.MergeSignals (newSignalsStore signalsStore)

let sseRemoveSignals<'T when 'T :> IDatastarSignalsStore> (signals:'T -> string[]) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignalsStore>) :?> 'T
    sseService.RemoveSignals (signals signalsStore)

let sseGenerator<'T when 'T :> IDatastarSignalsStore> (feed:HttpContext -> IServerSentEventService -> 'T -> Task) = (fun (ctx:HttpContext) ->
    task {
        let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
        let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignalsStore>) :?> 'T
        try
            do! feed ctx sseService signalsStore
        finally
            try
                ctx.Connection.RequestClose()
            finally ()
        } :> Task
    )