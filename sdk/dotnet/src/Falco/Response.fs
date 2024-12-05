module StarFederation.Datastar.Falco.Response

open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open StarFederation.Datastar
open StarFederation.Datastar.DependencyInjection

let sseMergeFragments<'T when 'T :> IDatastarSignals> (fragment:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signals = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.MergeFragments (fragment signals)

let sseRemoveFragments<'T when 'T :> IDatastarSignals> (selector:'T -> string) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signals = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.RemoveFragments (selector signals)

let sseMergeSignals<'T when 'T :> IDatastarSignals> (newSignals:'T -> IDatastarSignals) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signals = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.MergeSignals (newSignals signals)

let sseRemoveSignals<'T when 'T :> IDatastarSignals> (signals:'T -> string[]) = fun (ctx:HttpContext) ->
    let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
    let signals = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
    sseService.RemoveSignals (signals signals)

let sseGenerator<'T when 'T :> IDatastarSignals> (feed:HttpContext -> IServerSentEventService -> 'T -> Task) = (fun (ctx:HttpContext) ->
    task {
        let sseService = ctx.RequestServices.GetService(typedefof<IServerSentEventService>) :?> IServerSentEventService
        let signals = ctx.RequestServices.GetService(typedefof<IDatastarSignals>) :?> 'T
        try
            do! feed ctx sseService signals
        finally
            try
                ctx.Connection.RequestClose()
            finally ()
        } :> Task
    )
