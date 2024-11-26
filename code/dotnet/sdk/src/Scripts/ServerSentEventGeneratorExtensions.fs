namespace StarFederation.Datastar.Scripts

open StarFederation.Datastar.DependencyInjection

[<System.Runtime.CompilerServices.Extension>]
type ServerSentEventGeneratorExtensions() =

    [<System.Runtime.CompilerServices.Extension>]
    static member Redirect (sse:IServerSentEventService, url:string) =
        ServerSentEvent.redirect sse.Handler url
