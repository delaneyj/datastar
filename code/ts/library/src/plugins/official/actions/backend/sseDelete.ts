// Authors: Delaney Gillilan
// Icon: material-symbols:delete
// Slug: Use a DELETE request to fetch data from a server using Server-Sent Events matching the Datastar SDK interface
// Description: Remember, SSE is just a regular SSE request but with the ability to send 0-inf messages to the client.

import { ActionPlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import { sendSSERequest } from "./sseShared";

export const DeleteSSE: ActionPlugin = {
  type: PluginType.Action,
  name: "delete",
  fn: sendSSERequest("delete"),
};
