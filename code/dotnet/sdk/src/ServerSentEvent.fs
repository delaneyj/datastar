namespace StarFederation.Datastar

open System
open System.Text.RegularExpressions
open System.Threading.Tasks

type IDatastarStore = interface end
type DataStorePath = string
module DataStorePath =
    let value (dataStorePath:DataStorePath) = dataStorePath
    let create (dataStorePath:string) = DataStorePath dataStorePath
    let tryCreate (dataStorePath:string) = ValueSome (create dataStorePath)

type Selector = string
module Selector =
    let value (selector:Selector) = selector
    let regex = Regex(@"[#.][-_]?[_a-zA-Z]+(?:\w|\\.)*|(?<=\s+|^)(?:\w+|\*)|\[[^\s""'=<>`]+?(?<![~|^$*])([~|^$*]?=(?:['""].*['""]|[^\s""'=<>`]+))?\]|:[\w-]+(?:\(.*\))?", RegexOptions.Compiled)
    let create (selectorString:string) = Selector selectorString
    let tryCreate (selector:string) =
        match regex.IsMatch selector with
        | true -> ValueSome (create selector)
        | false -> ValueNone

type MergeFragmentOptions =
    { Selector: Selector voption
      MergeMode: FragmentMergeMode
      SettleDuration: TimeSpan
      UseViewTransition: bool }
module MergeFragmentOptions =
    let defaults = { Selector = ValueNone; MergeMode = Consts.DefaultFragmentMergeMode; SettleDuration = Consts.DefaultSettleDuration; UseViewTransition = Consts.DefaultUseViewTransitions }

type RemoveFragmentsOptions = { SettleDuration: TimeSpan; UseViewTransition: bool }
module RemoveFragmentsOptions =
    let defaults = { SettleDuration = Consts.DefaultSettleDuration; UseViewTransition = Consts.DefaultUseViewTransitions }

type EventOptions = { EventId: string voption; Retry: TimeSpan }
module EventOptions =
    let defaults = { EventId = ValueNone; Retry = Consts.DefaultSSERetryDuration }

type ISendEvent = abstract member SendEvent: string -> Task

type ServerSentEvent =
    { EventType: EventType
      Id: string voption
      Retry: TimeSpan
      DataLines: string[] }
module ServerSentEvent =
    let serializeEvent sseEvent =
        seq {
            $"event: {sseEvent.EventType |> Consts.EventType.toString}"

            if sseEvent.Id |> ValueOption.isSome
            then $"id: {sseEvent.Id |> ValueOption.get}"

            if (sseEvent.Retry <> Consts.DefaultSSERetryDuration)
            then $"retry: {sseEvent.Retry.Milliseconds}"

            yield! sseEvent.DataLines |> Array.map (fun dataLine -> $"data: {dataLine}")

            ""; ""
        } |> String.concat "\n"

    let send env sseEvent =
        let serializedEvent = sseEvent |> serializeEvent
        let sendEvent (env:ISendEvent) (event:string) = env.SendEvent(event)
        sendEvent env serializedEvent

    let mergeFragment env eventOptions options (fragment:string) =
        let fragmentLines = fragment.Split( [| "\r\n"; "\n"; "\r" |], StringSplitOptions.None)
        { EventType = Fragment
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [|
            if options.Selector |> ValueOption.isSome then $"{Consts.DatastarDatalineSelector} {options.Selector |> ValueOption.get |> Selector.value}"
            $"{Consts.DatastarDatalineMergeMode} {options.MergeMode |> Consts.FragmentMergeMode.toString}"
            if (options.SettleDuration <> Consts.DefaultSettleDuration) then $"{Consts.DatastarDatalineSettleDuration} {options.SettleDuration.Milliseconds}"
            if (options.UseViewTransition <> Consts.DefaultUseViewTransitions) then $"{Consts.DatastarDatalineUseViewTransition} {options.UseViewTransition |> Utility.toLower}"
            yield! (fragmentLines |> Seq.map (fun fragmentLine -> $"{Consts.DatastarDatalineFragment} %s{fragmentLine}"))
            |] }
        |> send env

    let removeFragments env eventOptions options selector =
        { EventType = Remove
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [|
            $"{Consts.DatastarDatalineSelector} {selector |> Selector.value}"
            if (options.SettleDuration <> Consts.DefaultSettleDuration) then $"{Consts.DatastarDatalineSettleDuration} {options.SettleDuration.Milliseconds}"
            if (options.UseViewTransition <> Consts.DefaultUseViewTransitions) then $"{Consts.DatastarDatalineUseViewTransition} {options.UseViewTransition |> Utility.toLower}"
            |] }
        |> send env

    let mergeSignals env eventOptions onlyIfMissing (data:string) =
        let dataLines = data.Split( [| "\r\n"; "\n"; "\r" |], StringSplitOptions.None)
        { EventType = Signal
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [|
            if onlyIfMissing <> Consts.DefaultOnlyIfMissing then $"{Consts.DefaultOnlyIfMissing} {onlyIfMissing |> Utility.toLower}"
            yield! (dataLines |> Seq.map (fun dataLine -> $"{Consts.DatastarDatalineStore} %s{dataLine}"))
            |] }
        |> send env

    let removeSignals env eventOptions paths =
        let paths' = paths |> Seq.map DataStorePath.value |> String.concat " "
        { EventType = Remove
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [| $"{Consts.DatastarDatalineSelector} {paths'}" |] }
        |> send env

    let redirect env eventOptions url =
        { EventType = Redirect
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [| $"{Consts.DatastarDatalineUrl} %s{url}" |] }
        |> send env

    let console env eventOptions mode message =
        { EventType = EventType.Console
          Id = eventOptions.EventId
          Retry = eventOptions.Retry
          DataLines = [| $"{mode |> Consts.ConsoleMode.toString} %s{message}" |] }
        |> send env
