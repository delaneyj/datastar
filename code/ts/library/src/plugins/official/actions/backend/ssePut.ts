// Authors: Delaney Gillilan
// Icon: material-symbols:find-replace
// Slug: Use a PUT request to fetch data from a server using Server-Sent Events matching the Datastar SDK interface
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { ActionPlugin } from "../../../../engine";
import { sendSSERequest } from "./sseShared";

export const PutSSE: ActionPlugin = {
    pluginType: "action",
    name: "put",
    method: sendSSERequest("put"),
};
