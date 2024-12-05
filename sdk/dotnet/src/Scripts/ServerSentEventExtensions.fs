namespace StarFederation.Datastar.Scripts

open System
open StarFederation.Datastar

type ConsoleAction =
    | Clear
    | Log of message:string
    | Error of message:string
module ConsoleAction =
    let escapeString (str:string) = str.Replace("'", @"\'")
    let toJavaScript =
        function
        | Clear -> "console.clear()"
        | Log message -> $"console.log('{escapeString message}')"
        | Error message -> $"console.log('{escapeString message}')"

type CustomEventOptions = {
    EventId: string voption
    Retry: TimeSpan
    Selector: Selector voption
    Bubbles: bool
    Cancelable: bool
    Composed: bool
}
module CustomEventOptions =
    let defaults =
        { EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration
          Selector = ValueNone
          Bubbles = true
          Cancelable = true
          Composed = true }

module ServerSentEvent =
    let consoleWithOptions (options:EventOptions) env consoleAction =
        let scriptOptions = { ExecuteScriptOptions.defaults with EventId = options.EventId; Retry = options.Retry }
        ServerSentEventGenerator.executeScriptWithOptions scriptOptions env (consoleAction |> ConsoleAction.toJavaScript)
    let console env = consoleWithOptions EventOptions.defaults env

    let redirectWithOptions (options:EventOptions) env url =
        let scriptOptions = { ExecuteScriptOptions.defaults with EventId = options.EventId; Retry = options.Retry }
        ServerSentEventGenerator.executeScriptWithOptions scriptOptions env $"window.location.href = '%s{url}';"
    let redirect env = redirectWithOptions EventOptions.defaults env

    let customEventWithOptions (options:CustomEventOptions) env eventName eventDetails =
        let elements =
            match options.Selector with
            | ValueNone -> "[document]"
            | ValueSome selector -> $"document.querySelectorAll('{selector}')"
        let customEventScript =
            [ $$"""const elements = {{elements}}"""
              $$"""const event = new CustomEvent('%%s{{eventName}}', { bubbles: %%A{{options.Bubbles}}, cancelable: %%A{{options.Cancelable}}, composed: %%A{{options.Composed}}, detail: %%A{{eventDetails}} });"""
              $$"""elements.forEach((element) => { element.dispatchEvent(event); });""" ]
            |> String.concat "\n"
        let scriptOptions = { ExecuteScriptOptions.defaults with EventId = options.EventId; Retry = options.Retry }
        ServerSentEventGenerator.executeScriptWithOptions scriptOptions env customEventScript
    let customEvent env = customEventWithOptions CustomEventOptions.defaults env

    let prefetchWithOptions (options:EventOptions) env urls =
        let urls' = urls |> Seq.map (fun url -> $@"""{url}""") |> String.concat ",\n"
        let prefetchScript =
            [ $$"""{ "prefetch": [ {        """
              $$"""  "source" : "list",     """
              $$"""  "urls" : [ {{urls'}} ] """
              $$"""} ] }                    """ ]
            |> String.concat "\n"
        let scriptOptions = { EventId = options.EventId; Retry = options.Retry; AutoRemove = false; Attributes = [| "type speculation" |] }
        ServerSentEventGenerator.executeScriptWithOptions scriptOptions env prefetchScript
    let prefetch env = prefetchWithOptions EventOptions.defaults env