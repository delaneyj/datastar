import { ActionMethod } from "../../../../engine";
import { DATASTAR } from "../../../../engine/consts";
import { ERR_BAD_ARGS } from "../../../../engine/errors";
import { remoteSignals } from "../../../../utils/signals";
import {
    fetchEventSource,
    FetchEventSourceInit,
} from "../../../../vendored/fetch-event-source";
import {
    DATASTAR_SSE_EVENT,
    DatastarSSEEvent,
    FINISHED,
    STARTED,
} from "../../watchers/backend/sseShared";

export type IndicatorReference = { el: HTMLElement; count: number };

const isWrongContent = (err: any) => `${err}`.includes(`text/event-stream`);

export type SSERequestArgs = {
    onlyRemoteSignals?: boolean;
    headers?: Record<string, string>;
};

function dispatchSSE(type: string, argsRaw: Record<string, string>) {
    document.dispatchEvent(
        new CustomEvent<DatastarSSEEvent>(DATASTAR_SSE_EVENT, {
            detail: { type, argsRaw },
        }),
    );
}

export function sendSSERequest(
    method: string,
): ActionMethod {
    return async (
        ctx,
        url,
        args?: SSERequestArgs,
    ) => {
        if (!!!url?.length) throw ERR_BAD_ARGS;

        const { onlyRemoteSignals, headers } = Object.assign({
            onlyRemoteSignals: true,
            headers: {
                CONTENT_TYPE: "application/json",
                DATASTAR_REQUEST: "true",
            },
        }, args);
        const currentStore = ctx.store().value;
        let store = Object.assign({}, currentStore);
        if (onlyRemoteSignals) {
            store = remoteSignals(store);
        }
        const storeJSON = JSON.stringify(store);

        const { el: { id: elID } } = ctx;
        dispatchSSE(STARTED, { elID });

        const urlInstance = new URL(url, window.location.origin);

        // https://fetch.spec.whatwg.org/#concept-method-normalize
        method = method.toUpperCase();

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
                    throw err;
                }
                // do nothing and it will retry
                if (err) {
                    console.error(err.message);
                }
            },
            onclose: () => {
                dispatchSSE(FINISHED, { elID });
            },
        };

        if (method === "GET") {
            const queryParams = new URLSearchParams(urlInstance.search);
            queryParams.append(DATASTAR, storeJSON);
            urlInstance.search = queryParams.toString();
        } else {
            req.body = storeJSON;
        }

        try {
            const revisedURL = urlInstance.toString();
            await fetchEventSource(revisedURL, req);
        } catch (err) {
            if (!isWrongContent(err)) {
                throw err;
            }

            // exit gracefully and do nothing if the content-type is wrong
            // this can happen if the client is sending a request
            // where no response is expected, and they haven't
            // set the content-type to text/event-stream
        }
    };
}
