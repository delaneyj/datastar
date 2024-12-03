// Icon: ic:baseline-get-app
// Slug: Use a GET request to fetch data from a server using Server-Sent Events matching the Datastar SDK interface
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { DATASTAR, DATASTAR_REQUEST } from "../../../../engine/consts";
import { dsErr, ErrorCodes } from "../../../../engine/errors";
import { ActionPlugin, PluginType } from "../../../../engine/types";
import {
    fetchEventSource,
    FetchEventSourceInit,
} from "../../../../vendored/fetch-event-source";
import {
    DATASTAR_SSE_EVENT,
    DatastarSSEEvent,
    FINISHED,
    STARTED,
} from "../shared";

type METHOD = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function dispatchSSE(type: string, argsRaw: Record<string, string>) {
    document.dispatchEvent(
        new CustomEvent<DatastarSSEEvent>(DATASTAR_SSE_EVENT, {
            detail: { type, argsRaw },
        }),
    );
}

const isWrongContent = (err: any) => `${err}`.includes(`text/event-stream`);

export type SSEArgs = {
    method: METHOD;
    headers?: Record<string, string>;
    onlyRemote?: boolean;
};

export const ServerSentEvents: ActionPlugin = {
    type: PluginType.Action,
    name: "sse",
    fn: async (
        ctx,
        url: string,
        args: SSEArgs = { method: "GET", headers: {}, onlyRemote: true },
    ) => {
        const { el: { id: elId }, signals } = ctx;
        const { headers: userHeaders, onlyRemote } = args;
        const method = args.method.toUpperCase();
        try {
            dispatchSSE(STARTED, { elId });
            if (!!!url?.length) {
                throw dsErr(ErrorCodes.NoUrlProvided);
            }

            const headers = Object.assign({
                "Content-Type": "application/json",
                [DATASTAR_REQUEST]: true,
            }, userHeaders);

            const req: FetchEventSourceInit = {
                method,
                headers,
                onmessage: (evt) => {
                    if (!evt.event.startsWith(DATASTAR)) {
                        return;
                    }
                    const type = evt.event;
                    const argsRawLines: Record<string, string[]> = {};

                    const lines = evt.data.split("\n");
                    for (const line of lines) {
                        const colonIndex = line.indexOf(" ");
                        const key = line.slice(0, colonIndex);
                        let argLines = argsRawLines[key];
                        if (!argLines) {
                            argLines = [];
                            argsRawLines[key] = argLines;
                        }
                        const value = line.slice(colonIndex + 1).trim();
                        argLines.push(value);
                    }

                    const argsRaw: Record<string, string> = {};
                    for (const [key, lines] of Object.entries(argsRawLines)) {
                        argsRaw[key] = lines.join("\n");
                    }

                    // if you aren't seeing your event you can debug by using this line in the console
                    // document.addEventListener("datastar-sse",(e) => console.log(e));
                    dispatchSSE(type, argsRaw);
                },
                onerror: (err) => {
                    if (isWrongContent(err)) {
                        // don't retry if the content-type is wrong
                        throw dsErr(ErrorCodes.WrongContentType, { url, err });
                    }
                    // do nothing and it will retry
                    if (err) {
                        console.error(err.message);
                    }
                },
            };

            const urlInstance = new URL(url, window.location.origin);
            const json = signals.JSON(false, onlyRemote);
            if (method === "GET") {
                const queryParams = new URLSearchParams(urlInstance.search);
                queryParams.set(DATASTAR, json);
                urlInstance.search = queryParams.toString();
            } else {
                req.body = json;
            }

            try {
                await fetchEventSource(urlInstance.toString(), req);
            } catch (err) {
                if (!isWrongContent(err)) {
                    throw dsErr(ErrorCodes.SseFailed, { url, err });
                }
                // exit gracefully and do nothing if the content-type is wrong
                // this can happen if the client is sending a request
                // where no response is expected, and they haven't
                // set the content-type to text/event-stream
            }
        } finally {
            dispatchSSE(FINISHED, { elId });
        }
    },
};
