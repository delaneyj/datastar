namespace StarFederation.Datastar

open System.Text
open System.Text.Json
open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Primitives
open Microsoft.Net.Http.Headers

type IServerSentEventContext =
    interface
        inherit ISendEvent
    end

type ServerSentEventGenerator (context:IServerSentEventContext) =
    new (httpContext:HttpContext) =
        ServerSentEventGenerator (ServerSentEventHttpContext httpContext)
    new (httpContextAccessor:IHttpContextAccessor) =
        ServerSentEventGenerator httpContextAccessor.HttpContext

    member private _.Context = context

    member this.MergeFragment = ServerSentEvent.mergeFragment this.Context EventOptions.defaults
    member this.RemoveFragments = ServerSentEvent.removeFragments this.Context EventOptions.defaults
    member this.MergeSignals = ServerSentEvent.mergeSignals this.Context EventOptions.defaults
    member this.RemoveSignals = ServerSentEvent.removeSignals this.Context EventOptions.defaults
    member this.Redirect = ServerSentEvent.redirect this.Context EventOptions.defaults
    member this.Console = ServerSentEvent.console this.Context EventOptions.defaults

    static member ReadSignals (httpRequest:HttpRequest) = task {
        let serializedDatastoreOptTask =
            match httpRequest.Method with
            | System.Net.WebRequestMethods.Http.Get ->
                Task.FromResult <|
                    match httpRequest.Query.TryGetValue(Consts.DatastarKey) with
                    | true, json when json.Count > 0 -> ValueSome (json[0])
                    | _ -> ValueNone
            | System.Net.WebRequestMethods.Http.Post ->
                task {
                    try
                        let! readResult = httpRequest.BodyReader.ReadAsync().AsTask()
                        let bytes = readResult.Buffer
                        let str = Encoding.UTF8.GetString(&bytes)
                        return (ValueSome str)
                    with _ -> return ValueNone
                    }
            | _ -> ValueNone |> Task.FromResult
        let! serializedDatastoreOpt = serializedDatastoreOptTask
        return
            try serializedDatastoreOpt |> ValueOption.map (fun serializedDatastore -> JsonSerializer.Deserialize<'T>(serializedDatastore))
            with _ -> ValueNone
            }

    static member ReadSignalsAsync<'T when 'T:null and 'T :> IDatastarStore> (httpRequest:HttpRequest) : Task<'T> = task {
        let! storeVOpt = ServerSentEventGenerator.ReadSignals(httpRequest)
        return
            match storeVOpt with
            | ValueSome store -> store
            | ValueNone -> null
     }

    with
    interface IServerSentEventGenerator with
        member this.MergeFragments(fragment) = ServerSentEvent.mergeFragment this.Context EventOptions.defaults MergeFragmentOptions.defaults fragment
        member this.MergeFragments(fragment, options) = ServerSentEvent.mergeFragment this.Context EventOptions.defaults options.AsOptions fragment
        member this.MergeFragments(fragment, options, eventOptions) = ServerSentEvent.mergeFragment this.Context eventOptions.AsOptions options.AsOptions fragment
        member this.RemoveFragments(selector) = ServerSentEvent.removeFragments this.Context EventOptions.defaults RemoveFragmentsOptions.defaults selector
        member this.RemoveFragments(selector, options) = ServerSentEvent.removeFragments this.Context EventOptions.defaults options.AsOptions selector
        member this.RemoveFragments(selector, options, eventOptions) = ServerSentEvent.removeFragments this.Context eventOptions.AsOptions { SettleDuration = options.SettleDuration; UseViewTransition = options.UseViewTransition } selector
        member this.MergeSignals(dataStoreMerge) = ServerSentEvent.mergeSignals this.Context EventOptions.defaults false dataStoreMerge
        member this.MergeSignals(dataStoreMerge:string, eventOptions:ServerSentEventOpts) = ServerSentEvent.mergeSignals this.Context eventOptions.AsOptions false dataStoreMerge
        member this.MergeSignals(dataStoreMerge:string, onlyIfMissing:bool) = ServerSentEvent.mergeSignals this.Context EventOptions.defaults onlyIfMissing dataStoreMerge
        member this.MergeSignals(dataStoreMerge:string, onlyIfMissing:bool, eventOptions:ServerSentEventOpts) = ServerSentEvent.mergeSignals this.Context eventOptions.AsOptions onlyIfMissing dataStoreMerge
        member this.RemoveSignals(dataStorePaths) = ServerSentEvent.removeSignals this.Context EventOptions.defaults dataStorePaths
        member this.RemoveSignals(dataStorePaths, eventOptions) = ServerSentEvent.removeSignals this.Context eventOptions.AsOptions dataStorePaths
        member this.Redirect(uri) = ServerSentEvent.redirect this.Context EventOptions.defaults uri
        member this.Redirect(uri, eventOptions) = ServerSentEvent.redirect this.Context eventOptions.AsOptions uri
        member this.Console(consoleMode, message) = ServerSentEvent.console this.Context EventOptions.defaults consoleMode message
        member this.Console(consoleMode, eventOptions, message) = ServerSentEvent.console this.Context eventOptions.AsOptions consoleMode message

and ServerSentEventHttpContext(httpContext:HttpContext) =
    do
        let setHeader (ctx:HttpContext) (name, content:string) =
            if ctx.Response.Headers.ContainsKey(name) |> not then
                ctx.Response.Headers.Add(name, StringValues(content))
        [
           ("Cache-Control", "no-cache")
           ("Connection", "keep-alive")
           (HeaderNames.ContentType, "text/event-stream")
        ] |> Seq.iter (setHeader httpContext)
        httpContext.Response.StartAsync().GetAwaiter().GetResult()
        httpContext.Response.Body.FlushAsync().GetAwaiter().GetResult()

    member _.Context = httpContext

    with
    interface IServerSentEventContext

    interface ISendEvent with
        member this.SendEvent(event:string) =
            let bytes = Encoding.UTF8.GetBytes(event)
            this.Context.Response.BodyWriter.WriteAsync(bytes).AsTask()

and IServerSentEventGenerator =
    abstract member MergeFragments: fragment:string -> Task
    abstract member MergeFragments: fragment:string * options:MergeFragmentOpts -> Task
    abstract member MergeFragments: fragment:string * options:MergeFragmentOpts * eventOptions:ServerSentEventOpts -> Task
    abstract member RemoveFragments: selector:Selector -> Task
    abstract member RemoveFragments: selector:Selector * options:RemoveFragmentsOpts -> Task
    abstract member RemoveFragments: selector:Selector * options:RemoveFragmentsOpts * eventOptions:ServerSentEventOpts -> Task
    abstract member MergeSignals: dataStore:string -> Task
    abstract member MergeSignals: dataStore:string * eventOptions:ServerSentEventOpts -> Task
    abstract member MergeSignals: dataStore:string * onlyIfMissing:bool -> Task
    abstract member MergeSignals: dataStore:string * onlyIfMissing:bool * eventOptions:ServerSentEventOpts -> Task
    abstract member RemoveSignals: paths:DataStorePath seq -> Task
    abstract member RemoveSignals: paths:DataStorePath seq * eventOptions:ServerSentEventOpts -> Task
    abstract member Redirect: url:string -> Task
    abstract member Redirect: url:string * eventOptions:ServerSentEventOpts -> Task
    abstract member Console: consoleMode:ConsoleMode * message:string -> Task
    abstract member Console: consoleMode:ConsoleMode * eventOptions:ServerSentEventOpts * message:string -> Task

and MergeFragmentOpts() =
    member val MergeMode = MergeFragmentOptions.defaults.MergeMode with get, set
    member val Selector = null with get, set
    member val SettleDuration = MergeFragmentOptions.defaults.SettleDuration with get, set
    member val UseViewTransition = MergeFragmentOptions.defaults.UseViewTransition with get, set
    member this.AsOptions =
        { MergeMode = this.MergeMode
          Selector = Utility.ValueOption.fromNullable this.Selector
          SettleDuration = this.SettleDuration
          UseViewTransition = this.UseViewTransition }

and RemoveFragmentsOpts() =
    member val SettleDuration = MergeFragmentOptions.defaults.SettleDuration with get, set
    member val UseViewTransition = MergeFragmentOptions.defaults.UseViewTransition with get, set
    member this.AsOptions =
        { SettleDuration = this.SettleDuration
          UseViewTransition = this.UseViewTransition }

and ServerSentEventOpts() =
    member val EventId = null with get, set
    member val Retry = Consts.DefaultSSERetryDuration with get, set
    member this.AsOptions =
        { EventId = Utility.ValueOption.fromNullable this.EventId
          Retry = this.Retry }
