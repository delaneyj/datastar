namespace StarFederation.Datastar

open System.IO
open System.Text
open System.Threading.Tasks
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Primitives
open Microsoft.Net.Http.Headers

type IServerSentEventHandler =
    interface
        inherit ISendServerEvent
        inherit IReadRawSignals
    end

type  ServerSentEventHttpHandler(httpContext:HttpContext) =
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

    member _.HttpContext = httpContext

    static member ReadRawSignals (httpRequest:HttpRequest) : ValueTask<Result<string, exn>> =
        let retrieveTask =
            match httpRequest.Method with
            | System.Net.WebRequestMethods.Http.Get ->
                match httpRequest.Query.TryGetValue(Consts.DatastarKey) with
                | true, json when json.Count > 0 -> Ok (json[0])
                | _ -> Error (exn "datastar key not found in query not found")
                |> ValueTask.FromResult
            | System.Net.WebRequestMethods.Http.Post ->
                task {
                    try
                        use readResult = new StreamReader(httpRequest.BodyReader.AsStream())
                        let! str = readResult.ReadToEndAsync()
                        return (Ok str)
                    with ex -> return Error ex
                    }
                |> ValueTask<Result<string, exn>>
            | _ -> (Error (exn $"Unknown HTTP method: {httpRequest.Method}")) |> ValueTask.FromResult
        retrieveTask

    with
    interface IServerSentEventHandler

    interface ISendServerEvent with
        member this.SendServerEvent(event:string) =
            let bytes = Encoding.UTF8.GetBytes(event)
            this.HttpContext.Response.BodyWriter.WriteAsync(bytes).AsTask()

    interface IReadRawSignals with
        member this.ReadRawSignals () = ServerSentEventHttpHandler.ReadRawSignals(this.HttpContext.Request)
