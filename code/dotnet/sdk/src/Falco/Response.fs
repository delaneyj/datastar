module StarFederation.Datastar.Falco.Response

open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open StarFederation.Datastar
open StarFederation.Datastar.DependencyInjection

let sseMergeFragments<'T when 'T :> IDatastarSignals> (fragment:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.MergeFragments (fragment signalsStore)

let sseRemoveFragments<'T when 'T :> IDatastarSignals> (selector:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.RemoveFragments (selector signalsStore)

let sseMergeSignals<'T when 'T :> IDatastarSignals> (newSignalsStore:'T -> IDatastarSignals) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.MergeSignals (newSignalsStore signalsStore)

let sseRemoveSignals<'T when 'T :> IDatastarSignals> (signals:'T -> string[]) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.RemoveSignals (signals signalsStore)

let sseGenerator<'T when 'T :> IDatastarSignals> (feed:HttpContext -> IServerSentEventService -> 'T -> Task) = (fun (ctx:HttpContext) ->
    task {
        let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
        let signalsStore = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
        try
            do! feed ctx sseService signalsStore
        finally
            try
                ctx.Connection.RequestClose()
            finally ()
        } :> Task
    )
