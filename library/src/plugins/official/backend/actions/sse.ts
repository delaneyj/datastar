// Icon: ic:baseline-get-app
// Slug: Use a GET request to fetch data from a server using Server-Sent Events matching the Datastar SDK interface
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { DATASTAR, DATASTAR_REQUEST } from "../../../../engine/consts";
import { dsErr } from "../../../../engine/errors";
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
    includeLocal?: boolean;
    openWhenHidden?: boolean;
    retryScaler?: number;
    retryMaxWaitMs?: number;
    retryMaxCount?: number;
    abort?: AbortSignal;
};

export const ServerSentEvents: ActionPlugin = {
    type: PluginType.Action,
    name: "sse",
    fn: async (
        ctx,
        url: string,
        args: SSEArgs,
    ) => {
        const { el: { id: elId }, signals } = ctx;
        const {
            method: methodAnyCase,
            headers: userHeaders,
            includeLocal,
            openWhenHidden,
            retryScaler,
            retryMaxWaitMs,
            retryMaxCount,
            abort,
        } = Object
            .assign({
                method: "GET",
                headers: {},
                includeLocal: false,
                openWhenHidden: false, // will keep the request open even if the document is hidden.
                retryScaler: 2, // the amount to multiply the retry interval by each time
                retryMaxWaitMs: 30_000, // the maximum retry interval in milliseconds
                retryMaxCount: 10, // the maximum number of retries before giving up
                abort: undefined,
            }, args);
        const method = methodAnyCase.toUpperCase();
        try {
            dispatchSSE(STARTED, { elId });
            if (!!!url?.length) {
                throw dsErr("NoUrlProvided");
            }

            const headers = Object.assign({
                "Content-Type": "application/json",
                [DATASTAR_REQUEST]: true,
            }, userHeaders);

            const req: FetchEventSourceInit = {
                method,
                headers,
                openWhenHidden,
                retryScaler,
                retryMaxWaitMs,
                retryMaxCount,
                signal: abort,
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
                onerror: (error) => {
                    if (isWrongContent(error)) {
                        // don't retry if the content-type is wrong
                        throw dsErr("InvalidContentType", { url, error });
                    }
                    // do nothing and it will retry
                    if (error) {
                        console.error(error.message);
                    }
                },
            };

            const urlInstance = new URL(url, window.location.origin);
            const json = signals.JSON(false, !includeLocal);
            if (method === "GET") {
                const queryParams = new URLSearchParams(urlInstance.search);
                queryParams.set(DATASTAR, json);
                urlInstance.search = queryParams.toString();
            } else {
                req.body = json;
            }

            try {
                await fetchEventSource(urlInstance.toString(), req);
            } catch (error) {
                if (!isWrongContent(error)) {
                    throw dsErr("SseFetchFailed", { method, url, error });
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
