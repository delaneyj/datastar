namespace StarFederation.Datastar

open System
open System.Text.Json
open System.Text.RegularExpressions
open System.Threading.Tasks
open StarFederation.Datastar.Utility

type ISendServerEvent = abstract SendServerEvent: string -> Task
type IReadRawSignalsStore = abstract ReadRawSignalStore: unit -> ValueTask<Result<string, exn>>

type IDatastarSignals =
    abstract Serialize : unit -> string

type ServerSentEvent =
    { EventType: EventType
      Id: string voption
      Retry: TimeSpan
      DataLines: string[] }
module ServerSentEvent =
    let serialize sse =
        seq {
            $"event: {sse.EventType |> Consts.EventType.toString}"

            if sse.Id |> ValueOption.isSome
            then $"id: {sse.Id |> ValueOption.get}"

            if (sse.Retry <> Consts.DefaultSseRetryDuration)
            then $"retry: {sse.Retry.Milliseconds}"

            yield! sse.DataLines |> Array.map (fun dataLine -> $"data: {dataLine}")

            ""; ""
        } |> String.concat "\n"

module DatastarSignalStore =
    let private readRawSignals (env:IReadRawSignalsStore) = env.ReadRawSignalStore()

    let readSignalsWithDeserialize<'T when 'T :> IDatastarSignals>  (deserialize:string -> Result<'T, exn>) env = task {
        let! rawSignal = readRawSignals env
        return rawSignal |> Result.bind deserialize
    }
    let readSignals<'T when 'T :> IDatastarSignals> env = readSignalsWithDeserialize (tryDeserialize JsonSerializer.Deserialize<'T>) env

type DataSignalPath = string
module DataSignalPath =
    let value = id
    let create (dataSignalPath:string) = DataSignalPath dataSignalPath
    let tryCreate (dataSignalPath:string) = ValueSome (create dataSignalPath)

type Selector = string
module Selector =
    let value = id
    let regex = Regex(@"[#.][-_]?[_a-zA-Z]+(?:\w|\\.)*|(?<=\s+|^)(?:\w+|\*)|\[[^\s""'=<>`]+?(?<![~|^$*])([~|^$*]?=(?:['""].*['""]|[^\s""'=<>`]+))?\]|:[\w-]+(?:\(.*\))?", RegexOptions.Compiled)
    let create (selectorString:string) = Selector selectorString
    let tryCreate (selector:string) =
        match regex.IsMatch selector with
        | true -> ValueSome (create selector)
        | false -> ValueNone

type MergeFragmentsOptions =
    { Selector: Selector voption
      MergeMode: FragmentMergeMode
      SettleDuration: TimeSpan
      UseViewTransition: bool
      EventId: string voption
      Retry: TimeSpan }
module MergeFragmentsOptions =
    let defaults =
        { Selector = ValueNone
          MergeMode = Consts.DefaultFragmentMergeMode
          SettleDuration = Consts.DefaultSettleDuration
          UseViewTransition = Consts.DefaultFragmentsUseViewTransitions
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

type RemoveFragmentsOptions =
    { SettleDuration: TimeSpan
      UseViewTransition: bool
      EventId: string voption
      Retry: TimeSpan }
module RemoveFragmentsOptions =
    let defaults =
        { SettleDuration = Consts.DefaultSettleDuration
          UseViewTransition = Consts.DefaultFragmentsUseViewTransitions
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

type ExecuteScriptOptions =
    { AutoRemove: bool
      Attributes: string[]
      EventId: string voption
      Retry: TimeSpan }
module ExecuteScriptOptions =
    let defaults =
        { AutoRemove = Consts.DefaultExecuteScriptAutoRemove
          Attributes = [| Consts.DefaultExecuteScriptAttributes |]
          EventId = ValueNone
          Retry = Consts.DefaultSseRetryDuration }

type EventOptions = { EventId: string voption; Retry: TimeSpan }
module EventOptions =
    let defaults = { EventId = ValueNone; Retry = Consts.DefaultSseRetryDuration }

